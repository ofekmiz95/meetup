import os from "os";

export function getLocalIp(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    // Skip VPN/virtual adapters
    if (/loopback|vmware|vbox|vpn|tap|tun/i.test(name)) continue;

    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }

  // fallback to loopback if no external interface found
  return "127.0.0.1";
}
