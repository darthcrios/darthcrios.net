document.addEventListener('DOMContentLoaded', () => {
    fetch('blogposts.json')
        .then(response => response.json())
        .then(data => {
            const blogPostsSection = document.getElementById('blog-posts');
            data.forEach(post => {
                const article = document.createElement('article');
                article.innerHTML = `
                    <h2><a href="${post.url}">${post.title}</a></h2>
                    <p>Published on: <time datetime="${post.date}">${new Date(post.date).toDateString()}</time></p>
                    <p>${post.summary}</p>
                    <a href="${post.url}">Read more...</a>
                `;
                blogPostsSection.appendChild(article);
            });
        })
        .catch(error => console.error('Error fetching blog posts:', error));
});
