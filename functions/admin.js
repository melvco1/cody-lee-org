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
        const timestamp = new Date().toISOString();

        const post = {
            title,
            body,
            tags,
            content,
            slug,
            timestamp
        };

        if (!env.BLOG_POSTS) {
            console.error('KV namespace BLOG_POSTS not found');
            return new Response('Server error: KV namespace not found', { status: 500 });
        }

        await env.BLOG_POSTS.put(`post:${slug}`, JSON.stringify(post));
        console.log('Post saved to KV:', { slug });

        return new Response('Post published successfully!', { status: 200 });
    } catch (error) {
        console.error('Function error:', error.message, error.stack);
        return new Response('Server error: ' + error.message, { status: 500 });
    }
}

export async function onRequestGet({ env }) {
    try {
        if (!env.BLOG_POSTS) {
            console.error('KV namespace BLOG_POSTS not found');
            return new Response('Server error: KV namespace not found', { status: 500 });
        }

        const keys = await env.BLOG_POSTS.list();
        const posts = [];
        for (const key of keys.keys) {
            const post = await env.BLOG_POSTS.get(key.name);
            if (post) {
                posts.push(JSON.parse(post));
            }
        }
        posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log('Posts fetched from KV:', posts);
        return new Response(JSON.stringify(posts), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching posts:', error.message, error.stack);
        return new Response('Server error: ' + error.message, { status: 500 });
    }
}