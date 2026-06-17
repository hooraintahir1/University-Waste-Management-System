const bcrypt = require('bcryptjs');

async function main() {
  const users = [
    { label: 'manager123', password: 'manager123' },
    { label: 'admin123',   password: 'admin123'   },
    { label: 'cleaner123', password: 'cleaner123' }
  ];
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    console.log(`${u.label} => ${hash}`);
  }
}
main();
