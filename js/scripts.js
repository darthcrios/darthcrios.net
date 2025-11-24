document.addEventListener('DOMContentLoaded', () => {
    fetch('blogposts.json')
        .then(response => response.json())
        .then(data => {
            const blogPostsSection = document.getElementById('blog-posts');
            // Sort posts by date in descending order
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            data.forEach(post => {
                const article = document.createElement('article');
                article.innerHTML = `
  ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}" class="post-thumb">` : ''}
  <h3><a href="${post.url}" style="color: white;">${post.title}</a></h3>
  <p style="color: white;">Published on: <time datetime="${post.date}">${new Date(post.date).toDateString()}</time></p>
  <p style="color: white;">${post.summary}</p>
  <a href="${post.url}" style="color: #EB6123;">Read more...</a>
`;
                blogPostsSection.appendChild(article);
            });
        })
        .catch(error => console.error('Error fetching blog posts:', error));
});
