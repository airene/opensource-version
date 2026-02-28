// index.ts
async function getGithubLatest(owner, repo) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Bun-Version-Monitor",
            },
        });
        const data = await response.json();
        return {new_version: data.tag_name} // 通常是 v1.0.0 这种格式
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function main() {

    const apps = [
        {
            name: "Obsidian",
            owner: "obsidianmd",
            repo: "obsidian-releases",
            version: "v1.12.4"
        },
        {
            name: "Clash",
            owner: "clash-verge-rev",
            repo: "clash-verge-rev",
            version: "v2.4.6"
        },
        {
            name: "FileBrowser",
            owner: "filebrowser",
            repo: "filebrowser",
            version: "v2.60.0"
        },
        {
            name: "Gitea",
            owner: "go-gitea",
            repo: "gitea",
            version: "v1.25.4"
        },
        {
            name: "Caddy",
            owner: "caddyserver",
            repo: "caddy",
            version: "v2.11.1"
        },
    ];

    const tasks = apps.map(async (app) => {
        let version = await getGithubLatest(app.owner, app.repo);
        return {name: app.name, version: app.version, changelog: `https://github.com/${app.owner}/${app.repo}/releases`, ...version};
    });

    const results = await Promise.all(tasks);
    return Response.json({
        status: 'success',
        data: results,
    })
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // 或者指定的域名
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const withCors = (handler) => async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {headers: corsHeaders})
    }
    const response = await handler(req)
    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value)
    }
    return response
}
Bun.serve({
    port: 8008,
    routes: {
        '/': () => new Response('service is ok'),
        '/github': withCors(() => main()),
        "/*": () => new Response("404"),
    },
    fetch() {
        return withCors(new Response('Not Found', {status: 404}))
    },
})

console.log('Server running at http://localhost:8008')