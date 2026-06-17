import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { notifyChatChange } from './catalogSync.js';
import {
  chatExists,
  getChatCustomerEmail,
  insertChatMessage,
  markChatMessagesRead,
  type ChatSenderRole,
} from './chatService.js';

type ClientRole = ChatSenderRole;

type ClientMeta = {
  role: ClientRole;
  email?: string;
  subscribedChats: Set<string>;
};

type WsAuthMessage = {
  type: 'auth';
  role: ClientRole;
  email?: string;
};

type WsSubscribeMessage = {
  type: 'subscribe';
  chatId: string;
};

type WsSendMessage = {
  type: 'send';
  chatId: string;
  body: string;
  sender_name: string;
};

type WsReadMessage = {
  type: 'read';
  chatId: string;
};

type WsClientMessage = WsAuthMessage | WsSubscribeMessage | WsSendMessage | WsReadMessage;

type WsServerMessage =
  | { type: 'connected' }
  | { type: 'message'; chatId: string; message: Record<string, unknown> }
  | { type: 'read'; chatId: string; audience: ClientRole }
  | { type: 'chat_updated'; chatId: string; customerEmail: string }
  | { type: 'error'; message: string };

const clients = new Map<WebSocket, ClientMeta>();

function sendJson(socket: WebSocket, payload: WsServerMessage) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() ?? '';
}

function shouldReceiveForChat(meta: ClientMeta, customerEmail: string) {
  if (meta.role === 'salon') return true;
  return normalizeEmail(meta.email) === normalizeEmail(customerEmail);
}

function broadcastToChat(
  chatId: string,
  customerEmail: string,
  payload: WsServerMessage,
  except?: WebSocket,
) {
  for (const [socket, meta] of clients) {
    if (socket === except) continue;
    if (!shouldReceiveForChat(meta, customerEmail)) continue;
    sendJson(socket, payload);
  }
}

export function broadcastChatMessage(
  chatId: string,
  customerEmail: string,
  message: Record<string, unknown>,
  except?: WebSocket,
) {
  broadcastToChat(chatId, customerEmail, { type: 'message', chatId, message }, except);
}

export function broadcastChatRead(chatId: string, customerEmail: string, audience: ClientRole) {
  broadcastToChat(chatId, customerEmail, { type: 'read', chatId, audience });
}

export function broadcastChatUpdated(chatId: string, customerEmail: string) {
  broadcastToChat(chatId, customerEmail, { type: 'chat_updated', chatId, customerEmail });
}

async function handleSend(socket: WebSocket, meta: ClientMeta, msg: WsSendMessage) {
  const body = msg.body?.trim();
  if (!body) {
    sendJson(socket, { type: 'error', message: 'Message is required' });
    return;
  }
  const senderName = msg.sender_name?.trim();
  if (!senderName) {
    sendJson(socket, { type: 'error', message: 'sender_name is required' });
    return;
  }
  if (meta.role !== 'customer' && meta.role !== 'salon') {
    sendJson(socket, { type: 'error', message: 'Authenticate before sending' });
    return;
  }

  const chatId = msg.chatId;
  if (!chatId || !(await chatExists(chatId))) {
    sendJson(socket, { type: 'error', message: 'Chat not found' });
    return;
  }

  const customerEmail = await getChatCustomerEmail(chatId);
  if (!customerEmail) {
    sendJson(socket, { type: 'error', message: 'Chat not found' });
    return;
  }

  if (meta.role === 'customer' && normalizeEmail(meta.email) !== normalizeEmail(customerEmail)) {
    sendJson(socket, { type: 'error', message: 'Not allowed' });
    return;
  }

  const message = await insertChatMessage({
    chatId,
    body,
    senderRole: meta.role,
    senderName,
  });

  notifyChatChange(chatId);
  const payload = { type: 'message' as const, chatId, message };
  sendJson(socket, payload);
  broadcastChatMessage(chatId, customerEmail, message, socket);
  broadcastChatUpdated(chatId, customerEmail);
}

async function handleRead(socket: WebSocket, meta: ClientMeta, msg: WsReadMessage) {
  const chatId = msg.chatId;
  if (!chatId || !(await chatExists(chatId))) {
    sendJson(socket, { type: 'error', message: 'Chat not found' });
    return;
  }

  const customerEmail = await getChatCustomerEmail(chatId);
  if (!customerEmail) {
    sendJson(socket, { type: 'error', message: 'Chat not found' });
    return;
  }

  if (meta.role === 'customer' && normalizeEmail(meta.email) !== normalizeEmail(customerEmail)) {
    sendJson(socket, { type: 'error', message: 'Not allowed' });
    return;
  }

  await markChatMessagesRead(chatId, meta.role);
  notifyChatChange(chatId);
  broadcastChatRead(chatId, customerEmail, meta.role);
  broadcastChatUpdated(chatId, customerEmail);
}

function handleClientMessage(socket: WebSocket, raw: string) {
  let msg: WsClientMessage;
  try {
    msg = JSON.parse(raw) as WsClientMessage;
  } catch {
    sendJson(socket, { type: 'error', message: 'Invalid JSON' });
    return;
  }

  const meta = clients.get(socket);

  if (msg.type === 'auth') {
    if (msg.role !== 'customer' && msg.role !== 'salon') {
      sendJson(socket, { type: 'error', message: 'role must be customer or salon' });
      return;
    }
    if (msg.role === 'customer' && !msg.email?.trim()) {
      sendJson(socket, { type: 'error', message: 'email is required for customer' });
      return;
    }
    clients.set(socket, {
      role: msg.role,
      email: msg.email?.trim(),
      subscribedChats: new Set(),
    });
    sendJson(socket, { type: 'connected' });
    return;
  }

  if (!meta) {
    sendJson(socket, { type: 'error', message: 'Authenticate first' });
    return;
  }

  if (msg.type === 'subscribe') {
    if (msg.chatId) meta.subscribedChats.add(msg.chatId);
    return;
  }

  if (msg.type === 'send') {
    void handleSend(socket, meta, msg);
    return;
  }

  if (msg.type === 'read') {
    void handleRead(socket, meta, msg);
  }
}

export function initChatWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/api/chats/ws' });

  wss.on('connection', (socket) => {
    socket.on('message', (data) => {
      handleClientMessage(socket, data.toString());
    });

    socket.on('close', () => {
      clients.delete(socket);
    });
  });

  return wss;
}
