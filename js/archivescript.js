document.addEventListener('DOMContentLoaded', () => {
    // Load JSON
    fetch('blogposts.json')
        .then(response => response.json())
        .then(data => {

            const archiveSection = document.getElementById('archive-posts');

            if (!archiveSection) return;

            // Sort by newest → oldest
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            data.forEach(post => {
                const article = document.createElement('article');
                article.classList.add('archive-post');

                article.innerHTML = `
                    ${post.thumbnail ? `<img src="${post.thumbnail}" alt="${post.title}" class="post-thumb">` : ''}
                    
                    <h2>${post.title}</h2>

                    <p class="date">
                        <time datetime="${post.date}">
                            ${new Date(post.date).toDateString()}
                        </time>
                    </p>

                    <p>${post.summary}</p>

                    <a href="${post.url}" style="color:#EB6123;">Read more…</a>
                `;

                archiveSection.appendChild(article);
            });
        })
        .catch(error => console.error('Error loading archive posts:', error));
});

