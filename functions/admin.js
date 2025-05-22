export async function onRequestPost({ request, env }) {
    try {
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
        console.log('GitHub API response:', { status: response.status, body: responseBody });

        if (!response.ok) {
            console.error('GitHub API error:', responseBody);
            return new Response('Failed to publish post: ' + responseBody, { status: response.status });
        }

        return new Response('Post published successfully!', { status: 200 });
    } catch (error) {
        console.error('Function error:', error.message, error.stack);
        return new Response('Server error: ' + error.message, { status: 500 });
    }
}