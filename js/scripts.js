document.addEventListener('DOMContentLoaded', () => {
    fetch('blogposts.json')
        .then(response => response.json())
        .then(data => {
            const blogPostsSection = document.getElementById('blog-posts');
            data.forEach(post => {
                const article = document.createElement('article');
                article.innerHTML = `
                  <h2><a href="${post.url}" style="color: red;">${post.title}</a></h2>
                    <p style="color: white;">Published on: <time datetime="${post.date}">${new Date(post.date).toDateString()}</time></p>
                    <p style="color: white;">${post.summary}</p>
                    <a href="${post.url}" style="color: green;">Read more...</a>
                `;
                blogPostsSection.appendChild(article);
            });
        })
        .catch(error => console.error('Error fetching blog posts:', error));
});
