import { Client } from "discord-rpc";

import { config } from "./config";

// internal state
let rpc: Client | undefined;
let reconnectTimer: NodeJS.Timeout | undefined;

export async function initDiscordRpc() {
  if (!config.discordRpc) return;

  // clean up existing client if one exists
  clearTimeout(reconnectTimer);
  rpc?.removeAllListeners();

  try {
    rpc = new Client({ transport: "ipc" });

    rpc.on("ready", () =>
      rpc?.setActivity({
        state: "stoat.chat",
        details: "Chatting with others",
        largeImageKey: "qr",
        largeImageText: "Join Stoat!",
        buttons: [
          {
            label: "Join Stoat",
            url: "https://stoat.chat/",
          },
        ],
      }),
    );

    rpc.on("disconnected", reconnect);

    await rpc.login({ clientId: "872068124005007420" });
  } catch (err) {
    reconnect();
  }
}

const reconnect = () => {
  clearTimeout(reconnectTimer);
  if (config.discordRpc) {
    reconnectTimer = setTimeout(() => initDiscordRpc(), 1e4);
  }
};

export async function destroyDiscordRpc() {
  clearTimeout(reconnectTimer);
  reconnectTimer = undefined;

  const client = rpc;
  rpc = undefined;
  client?.removeAllListeners();
  await client?.destroy().catch(() => undefined);
}
