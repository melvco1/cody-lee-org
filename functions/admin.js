export async function onRequestPost({ request, env }) {
    try {
        console.log('Starting /admin function execution');
        const formData = await request.formData();
        const title = formData.get('title');
        const body = formData.get('body');
        const tags = formData.get('tags');
        console.log('Form data received:', { title, body, tags });

        if (!title || !body) {
            console.error('Missing title or body');
            return new Response('Missing title or body', { status: 400 });
        }

        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const content = `# ${title}\n\n${body}${tags ? '\n\n**Tags:** ' + tags : ''}`;
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        console.log('Content prepared:', { slug, contentLength: content.length });

        const token = env.GITHUB_TOKEN || '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';
        console.log('Using token:', token ? 'Token present' : 'Token missing');

        const response = await fetch(`https://api.github.com/repos/melvco1/cody-lee-org/contents/posts/${slug}.md`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Cloudflare-Pages-Function'
            },
            body: JSON.stringify({
                message: `Add post: ${title}`,
                content: encodedContent,
                branch: 'main'
            })
        });

        const responseBody = await response.text();
        console.log('GitHub API response:', { status: response.status, headers: Object.fromEntries(response.headers), body: responseBody });

        if (!response.ok) {
            console.error('GitHub API error:', responseBody);
            return new Response('Failed to publish post: ' + responseBody, { status: response.status });
        }

        console.log('Post published successfully');
        return new Response('Post published successfully!', { status: 200 });
    } catch (error) {
        console.error('Function error:', error.message, error.stack);
        return new Response('Server error: ' + error.message, { status: 500 });
    }
}