// i made this so that the API URL can be easily changed in one place if needed
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadPostsButton = document.getElementById("loadPosts");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const postsContainer = document.getElementById("postsContainer");
const pagination = document.getElementById("pagination");
const status = document.getElementById("status");

const POSTS_PER_PAGE = 12;

let posts = []; // array to store fetched posts from API; ma reuse for diff actions
let currentPage = 1;

// since fetching data is asynch, waiting for response is needed before process
const fetchPosts = async () => { // async function to fetch posts from the API
    try {
        status.textContent = "Loading posts...";
        status.className = "status loading";

        const response = await fetch(API_URL); // waits for promise to finish

        // throws error if response is not ok
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json(); // response convert to js data

        posts = data;
        currentPage = 1;

        status.textContent = `${posts.length} posts loaded successfully.`;
        status.className = "status";

        updatePosts();

    } catch (error) {
        status.textContent = `Failed to load posts: ${error.message}`;
        status.className = "status error";

        postsContainer.innerHTML = "";
        pagination.innerHTML = "";

        console.error("Fetch error:", error);
    }
};

// get filtered posts based on search bar input
const getFilteredPosts = () => {
    // gets whatever user input/search no matter the casing
    const searchTerm = searchInput.value.toLowerCase().trim();

    // ES6 - filter checks posts and keeps the ones that match condition
    return posts.filter(({ title, body }) => // destructuring; gets
        // checks if search is in the text
        title.toLowerCase().includes(searchTerm) ||
        body.toLowerCase().includes(searchTerm)
    );
};

// sorts posts based on drop down
const sortPosts = (postList) => {
    const sortedPosts = [...postList]; // spread operator creates copy of array (sortedPosts) para di ma modify ang orig array
    const sortType = sortSelect.value;

    switch (sortType) {
        case "titleAsc":
            return sortedPosts.sort((a, b) => // compare titles of posts
                a.title.localeCompare(b.title)
            );

        case "titleDesc":
            return sortedPosts.sort((a, b) =>
                b.title.localeCompare(a.title)
            );

        case "idAsc":
            return sortedPosts.sort((a, b) =>
                a.id - b.id // if negative, a first
            );

        case "idDesc":
            return sortedPosts.sort((a, b) =>
                b.id - a.id // if positive, b first
            );

        default:
            return sortedPosts;
    }
};

// Display posts
const displayPosts = (postList) => {
    if (postList.length === 0) {
        postsContainer.innerHTML = `
            <p>No posts found.</p>
        `;

        return;
    }

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;

    // 
    const paginatedPosts = postList.slice(startIndex, endIndex);

    postsContainer.innerHTML = paginatedPosts
        .map(({ id, title, body }) => ` // ES6 - map used to make each post obj into html string to display them
            <article class="post">
                <div class="post-id">Post #${id}</div>
                <h2>${title}</h2>
                <p>${body}</p>
            </article>
        `)
        .join(""); // join used to combine all the html strings into one string to display them
};

// Display pagination controls
const displayPagination = (postList) => {
    const totalPages = Math.ceil(postList.length / POSTS_PER_PAGE);

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    // Previous button
    const previousButton = document.createElement("button");

    previousButton.textContent = "‹";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--; // when back is clicked
            updatePosts();

            // Return to top when changing pages
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });

    pagination.appendChild(previousButton);

    // Page number buttons
    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement("button");

        pageButton.textContent = page;

        if (page === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => {
            currentPage = page;
            updatePosts();

            // Return to top when changing pages
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement("button");

    nextButton.textContent = "›";
    nextButton.disabled = currentPage === totalPages;

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++; // when next is clicked
            updatePosts();

            // Return to top when changing pages
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });

    pagination.appendChild(nextButton);
};

// Update the displayed posts
// MOST IMPORTANT FUNCTION - this is the one that calls the other functions to update the posts based on search and sort
// posts, fetch and store posts, getfilteredposts(), filteredposts, sortposts(), sortedposts, displayposts(), displaypagination()
const updatePosts = () => {
    const filteredPosts = getFilteredPosts();
    const sortedPosts = sortPosts(filteredPosts);

    status.textContent = `${sortedPosts.length} post(s) found.`;

    displayPosts(sortedPosts);
    displayPagination(sortedPosts);
};

// Search posts
const searchPosts = () => {
    currentPage = 1;

    if (posts.length === 0) {
        return;
    }

    updatePosts();
};

// Sort posts
const changeSort = () => {
    currentPage = 1;

    if (posts.length === 0) {
        return;
    }

    updatePosts();
};

// Event listeners
// when load posts button is clicked, fetchPosts() is called
loadPostsButton.addEventListener("click", fetchPosts);

// when user types in search bar, searchPosts() is called
searchInput.addEventListener("input", searchPosts);

// when user changes sort option, changeSort() is called
sortSelect.addEventListener("change", changeSort);