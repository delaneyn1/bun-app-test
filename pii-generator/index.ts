let piiData: any[] = [];
let lastGenerated: Date = new Date();

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
const races = ["White", "Black", "Asian", "Hispanic", "Other"];
const sexes = ["Male", "Female", "Other"];

function generatePII() {
    const newRecords = [];
    for (let i = 0; i < 10; i++) { // Requirement: Exactly 10 records [cite: 12]
        newRecords.push({
            id: `user-row-${i}`, // Requirement: Predictable ID [cite: 23]
            fullName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            weight: `${Math.floor(Math.random() * (250 - 100) + 100)} lbs`,
            height: `${Math.floor(Math.random() * (80 - 55) + 55)} in`,
            sex: sexes[Math.floor(Math.random() * sexes.length)],
            race: races[Math.floor(Math.random() * races.length)],
            dob: new Date(1970 + Math.random() * 40, Math.random() * 12, Math.random() * 28).toISOString().split('T')[0]
        });
    }
    piiData = newRecords;
    lastGenerated = new Date();
}

generatePII();
setInterval(generatePII, 24 * 60 * 60 * 1000); // 24-hour rotation [cite: 13]

const server = Bun.serve({
    port: 3000, // [cite: 34]
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/api/json") {
            return new Response(JSON.stringify(piiData, null, 2), { headers: { "Content-Type": "application/json" } });
        }

        if (url.pathname === "/regenerate") {
            generatePII();
            return new Response(null, { status: 302, headers: { Location: "/" } });
        }

        return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PII Generator | Pipeline Target</title>
          <style>
              :root { --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --accent: #38bdf8; --border: #334155; }
              body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; display: flex; justify-content: center; }
              .container { width: 100%; max-width: 1000px; }
              header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
              h1 { margin: 0; font-size: 1.5rem; color: var(--accent); }
              .meta { font-size: 0.8rem; color: #94a3b8; }
              .actions { display: flex; gap: 10px; }
              button { cursor: pointer; background: var(--accent); border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; color: var(--bg); transition: opacity 0.2s; }
              button:hover { opacity: 0.9; }
              .btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); }
              table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
              th { background: #334155; text-align: left; padding: 12px 16px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
              td { padding: 12px 16px; border-top: 1px solid var(--border); font-size: 0.95rem; }
              tr:hover { background: #2d3748; }
              .badge { background: #334155; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
          </style>
      </head>
      <body>
          <div class="container">
              <header>
                  <div>
                      <h1>PII Pipeline Target</h1>
                      <div class="meta">Last Rotation: ${lastGenerated.toLocaleString()}</div>
                  </div>
                  <div class="actions">
                      <a href="/regenerate"><button>Force Rotate</button></a>
                      <button class="btn-outline" onclick="copyJson()">Copy JSON</button>
                  </div>
              </header>

              <table>
                  <thead>
                      <tr>
                          <th>Name</th><th>Weight</th><th>Height</th><th>Sex</th><th>Race</th><th>DOB</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${piiData.map(user => `
                          <tr id="${user.id}">
                              <td data-field="name"><strong>${user.fullName}</strong></td>
                              <td data-field="weight">${user.weight}</td>
                              <td data-field="height">${user.height}</td>
                              <td data-field="sex"><span class="badge">${user.sex}</span></td>
                              <td data-field="race">${user.race}</td>
                              <td data-field="dob">${user.dob}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>

          <script>
              async function copyJson() {
                  const res = await fetch('/api/json');
                  const data = await res.json();
                  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                  alert('JSON Data Copied!');
              }
          </script>
      </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
    },
});

console.log(`🚀 Prettier target running at http://localhost:${server.port}`);