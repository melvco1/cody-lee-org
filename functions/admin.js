export async function onRequestPost({ request }) {
    try {
        const formData = await request.formData();
        const title = formData.get('title');
        const body = formData.get('body');
        const tags = formData.get('tags');
        if (!title || !body) {
            return new Response('Missing title or body', { status: 400 });
        }

        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const content = `# ${title}\n\n${body}${tags ? '\n\n**Tags:** ' + tags : ''}`;
        const encodedContent = btoa(unescape(encodeURIComponent(content)));

        const response = await fetch('https://api.github.com/repos/melvco1/cody-lee-org/contents/posts/' + slug + '.md', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add post: ${title}`,
                content: encodedContent,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GitHub API error:', errorText);
            return new Response('Failed to publish post: ' + errorText, { status: response.status });
        }

        return new Response('Post published successfully!', { status: 200 });
    } catch (error) {
        console.error('Function error:', error.message);
        return new Response('Server error: ' + error.message, { status: 500 });
    }
}