export async function onRequestPost({ request }) {
    const formData = await request.formData();
    const title = formData.get('title');
    const body = formData.get('body');
    const tags = formData.get('tags');
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const content = `# ${title}\n\n${body}${tags ? '\n\n**Tags:** ' + tags : ''}`;
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const response = await fetch('https://api.github.com/repos/melvco1/cody-lee-org/contents/posts/' + slug + '.md', {
        method: 'PUT',
        headers: {
            'Authorization': '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',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Add post: ${title}`,
            content: encodedContent,
            branch: 'main'
        })
    });

    if (response.ok) {
        return new Response('Post published successfully!', { status: 200 });
    }
    return new Response('Failed to publish post: ' + response.statusText, { status: 500 });
}