document.addEventListener('DOMContentLoaded', () => {

// Grabing the elements we need to operate on
const thoughtsForm = document.querySelector('#thoughts-form')
const imageBox = document.getElementById('image-box')
const cycleButton = document.getElementById('change-movie')
const movieTextHeader = document.getElementById('movie-title')
const usernameInput = document.getElementById("username-input");
const commentInput = document.getElementById("comment-input");
const commentList = document.getElementById("comment-list");
const rateStars = document.querySelectorAll('.rating-star');
const plot = document.getElementById('plot')
const similarTitlesBox = document.getElementById('similar-titles-box');
const movieInfoBox = document.getElementById('movie-info-box');
// movieCount for cycling through gifs
let movieCount = 0
// currentMovieNum is a reference to the current displaying gif
let currentMovieNum

//URLS to shave down code as well as presaved API key just incase we use our quota and need a new one
const BASE_URL = "http://localhost:3000"
const API_KEY = "kyvBMFRFz9rtprGZi5TgvXDnKBdWhyv40iaxqk5X"
const API_URL = "https://api.watchmode.com/v1/title"



// Making all our submitables and clickables clickable and submitable ! 

thoughtsForm.addEventListener('submit',(e) => addNewComment(e))


rateStars.forEach(star => star.addEventListener('click', (e) => {
    const star = e.target
    const num = parseInt(star.id.replace("s",""), 10)
    persistStars(currentMovieNum, num)
}))


cycleButton.addEventListener('click', getMovie)

// congfiguration headers to shave down some lines of code
const createConfig = (method, body = {}) => {
    const newConfig = {
        method,
        headers: {"Content-Type": "application/json",
                  Accept: "application/json"},
        body: JSON.stringify(body)          
    }
    return newConfig
}
// All our functions, we can definately get clearer more understandable function and variable names

function getMovie(){
    movieCount += 1
    if (movieCount > 10) {
        movieCount = 1
    } 
    fetch(`${BASE_URL}/movies/${movieCount}`)
    .then(resp => resp.json())
    .then(movie => {
        featureMovie(movie)
        featureComments(movie.comments)
    })    
} 


function featureMovie(movie){
    imageBox.src = movie.gifURL
    movieTextHeader.textContent = movie.title
    currentMovieNum = movie.id
    movieRate(movie.rating)
    getMovieInfo(movie.IMBD)
}


function movieRate(n) {
    resetStars()
    rateStars.forEach((star)=>{
        const starNum = parseInt(star.id.replace("s",""), 10)
        if (starNum <= n) {
            star.src = './images/fullStar.png'
        }
    })
}


function resetStars(){
    rateStars.forEach((star) =>{
        star.src ='./images/star.png'
    })
}

function addNewComment(e) {
    e.preventDefault()
    const li = document.createElement("li");
    li.innerText = usernameInput.value + " says: " + commentInput.value;
    commentList.append(li);
    persistComment(li.innerText)
    e.target.reset()
}


function persistStars(movie, num){
    const rating = { rating: num}
    fetch(`${BASE_URL}/movies/${movie}`, createConfig('PATCH', rating))
    .then(resp => resp.json())
    .then(movie => movieRate(movie.rating))
}

function persistComment(content){
    fetch(`${BASE_URL}/comments`, createConfig('POST', {movieId: currentMovieNum, content: content}))
}


function featureComments(comments) {
    commentList.replaceChildren()
    comments.forEach((comment)=>{
        const li = document.createElement("li")
        li.textContent = comment.content
        commentList.append(li)
    })
}

//Below using an external API called watchmode to retrieve movie information 
//based on IMBD number of movie as well as 3 similar title reccomendations

function getMovieInfo(movie){
    fetch(`${API_URL}/${movie}/details/?apiKey=${API_KEY}`)
    .then((res) => res.json())
    .then((json) => {
        plotTODOM(json)
        getSimilarTitles(json['similar_titles']);
    });
}

// Random number generator to randomize similar titles instead of printing just the first three as before
const randomNumber = (max) => {
    return Math.floor(Math.random() * max);
  }

function getSimilarTitles (simTitles) {
    similarTitlesBox.replaceChildren()
    for(let i = 0; i < 3; i++){
        fetch(`${API_URL}/${simTitles[randomNumber(simTitles.length)]}/details/?apiKey=${API_KEY}`)
        .then(resp => resp.json())
        .then(movie => handleSimilarTitles(movie))
    }
}

function handleSimilarTitles(movie) {
    const li = document.createElement('li')
    const p = document.createElement('p')
    p.className = 'similar-movie-year'
    p.textContent = movie.year
    li.textContent = movie.title
    li.className = 'similarTitles'
    li.appendChild(p)
    similarTitlesBox.append(li)
}

function plotTODOM(movie){
    plot.textContent = movie['plot_overview']
}


// Below invoking the get movie as soon as page loads

getMovie()



})