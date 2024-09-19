document.addEventListener('DOMContentLoaded', () => {
    const movieModal = document.getElementById('movie-modal');
    const closeModalBtn = document.querySelector('.close');
    const addToFavouritesBtn = document.getElementById('add-to-favourites-btn');
    const searchBox = document.getElementById('search-box');
    const autocompleteList = document.getElementById('autocomplete-list');
    const favouritesGrid = document.getElementById('favourites-grid');
    const genreSections = document.getElementById('genre-sections');
    const backToTopButton = document.getElementById('back-to-top');
    const languageSwitcher = document.getElementById('language-switcher');
    const popularCarousel = document.getElementById('popular-carousel');
    const randomMovieBtn = document.getElementById('random-movie-btn');
    const filterYear = document.getElementById('filter-year');
    const filterRating = document.getElementById('filter-rating');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    
    let allMovies = [];
    let favourites = JSON.parse(localStorage.getItem('favourites')) || [];

    // Back to Top functionality
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Fetch Movies from API
    async function fetchMovies() {
        const url = 'https://imdb-top-100-movies.p.rapidapi.com/';
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'a4453afbafmsh4db21323ee7a0b5p160502jsn9e385cecf28f',
                'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('API unreachable');
            }
            const movies = await response.json();
            allMovies = movies;
            loadPopularMovies(movies);
            createGenreSections(movies);
            loadFavourites();
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    // Dynamically create genre sections
    function createGenreSections(movies) {
        const genres = {};

        movies.forEach(movie => {
            movie.genre.forEach(genre => {
                if (!genres[genre]) {
                    genres[genre] = [];
                }
                genres[genre].push(movie);
            });
        });

        // Create sections for each genre
        genreSections.innerHTML = ''; // Clear previous content
        Object.keys(genres).forEach(genre => {
            const section = document.createElement('section');
            section.innerHTML = `<h3>${genre} Movies</h3><div class="movie-grid" id="${genre.toLowerCase()}-movies"></div>`;
            genreSections.appendChild(section);
            appendMovies(document.getElementById(`${genre.toLowerCase()}-movies`), genres[genre]);
        });
    }

    // Populate Movies with animations
    function appendMovies(gridElement, movies) {
        gridElement.innerHTML = '';
        movies.forEach((movie, index) => {
            const img = document.createElement('img');
            img.src = movie.image;
            img.alt = movie.title;
            img.addEventListener('click', () => openModal(movie));
            gridElement.appendChild(img);

            // Add animation delay
            setTimeout(() => {
                img.classList.add('show-image');
            }, 100 * index);
        });
    }

    // Open Movie Modal with animation
    function openModal(movie) {
        movieModal.classList.add('show-modal');  // Add class for animation
        document.getElementById('modal-movie-title').textContent = movie.title;
        document.getElementById('modal-movie-image').src = movie.big_image;
        document.getElementById('modal-movie-description').textContent = movie.description;
        document.getElementById('imdb-rating').textContent = `IMDb Rating: ${movie.rating}`;
        document.getElementById('rotten-tomatoes-rating').textContent = `Rotten Tomatoes: ${getRottenTomatoesRating(movie.id)}`;
        addToFavouritesBtn.onclick = () => addToFavourites(movie);
    }

    // Placeholder for Rotten Tomatoes Rating
    function getRottenTomatoesRating(id) {
        return '95%'; // Static value for now, can be replaced with real API
    }

    // Close Movie Modal with animation
    closeModalBtn.addEventListener('click', () => {
        movieModal.classList.remove('show-modal');
    });

    // Add to Favourites
    function addToFavourites(movie) {
        if (!favourites.some(fav => fav.id === movie.id)) {
            favourites.push(movie);
            localStorage.setItem('favourites', JSON.stringify(favourites));
            loadFavourites();
        }
        movieModal.classList.remove('show-modal');
    }

    // Load Favourites from localStorage
    function loadFavourites() {
        favouritesGrid.innerHTML = '';
        favourites.forEach(movie => {
            const img = document.createElement('img');
            img.src = movie.image;
            img.alt = movie.title;
            img.addEventListener('click', () => openModal(movie));
            favouritesGrid.appendChild(img);

            // Add animation
            setTimeout(() => {
                img.classList.add('show-image');
            }, 100);
        });
    }

    // Search Functionality with Autocomplete
    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.toLowerCase();
        const filteredMovies = allMovies.filter(movie => movie.title.toLowerCase().includes(searchTerm));
        showAutocompleteSuggestions(filteredMovies);
    });

    function showAutocompleteSuggestions(movies) {
        autocompleteList.innerHTML = ''; // Clear previous suggestions
        if (searchBox.value === '') return;

        movies.slice(0, 5).forEach(movie => { // Limit to top 5 suggestions
            const item = document.createElement('li');
            item.textContent = movie.title;
            item.addEventListener('click', () => {
                searchBox.value = movie.title;
                autocompleteList.innerHTML = '';
                openModal(movie);
            });
            autocompleteList.appendChild(item);
        });
    }

    // Hide autocomplete on blur
    searchBox.addEventListener('blur', () => {
        setTimeout(() => {
            autocompleteList.innerHTML = '';
        }, 100);
    });

    // Apply Filters for Year and Rating
    applyFiltersBtn.addEventListener('click', () => {
        const year = filterYear.value || 0;
        const rating = filterRating.value || 0;
        const filteredMovies = allMovies.filter(movie => movie.year >= year && movie.rating >= rating);
        genreSections.innerHTML = '';  // Clear previous genre sections
        createGenreSections(filteredMovies);  // Apply new filters
    });

    // Random Movie Generator
    randomMovieBtn.addEventListener('click', () => {
        const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
        openModal(randomMovie);
    });

    // Load Popular Movies in Carousel
    function loadPopularMovies(movies) {
        const popularMovies = movies.slice(0, 10); // Example: top 10 popular movies
        popularCarousel.innerHTML = ''; // Clear previous carousel content

        popularMovies.forEach((movie, index) => {
            const img = document.createElement('img');
            img.src = movie.image;
            img.alt = movie.title;
            img.addEventListener('click', () => openModal(movie));
            popularCarousel.appendChild(img);

            // Add animation
            setTimeout(() => {
                img.classList.add('show-image');
            }, 100 * index);
        });
    }

    // Handle Language Switcher
    languageSwitcher.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        // Handle translation of the site content into selected language
        console.log(`Language changed to: ${selectedLanguage}`);
    });

    // Fetch movies on page load
    fetchMovies();
});
