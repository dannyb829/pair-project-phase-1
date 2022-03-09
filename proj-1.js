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
// currentMovieId is a reference to the currently displayed movies IMBD number
let currentMovieId



// Making all our submitables and clickables clickable and submitable ! 

thoughtsForm.addEventListener('submit',(e) => addComment(e))


rateStars.forEach(star => star.addEventListener('click', (e) => {
    const star = e.target
    const num = parseInt(star.id.replace("s",""), 10)
    persistStars(currentMovieNum, num)
}))


cycleButton.addEventListener('click', getMovie)


// All our functions, we can definately get clearer more understandable function and variable names

function getMovie(){
    movieCount += 1
    if (movieCount >= 10) {
        movieCount = 1
    } 
    fetch(`http://localhost:3000/movies/${movieCount}`)
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
    currentMovieId = movie.IMBD
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

function addComment(e) {
    e.preventDefault()
    const li = document.createElement("li");
    li.innerText = usernameInput.value + " says: " + commentInput.value;
    commentList.append(li);
    persistComment(li.innerText)
    e.target.reset()
}

//

function persistStars(movie, num){
    const rating = { rating: num}
    fetch(`http://localhost:3000/movies/${movie}`, {
        method: 'PATCH',
        headers: {"Content-Type": "application/json",
        Accept: "application/json"},
        body: JSON.stringify(rating)          
    })
    .then(resp => resp.json())
    .then(movie => movieRate(movie.rating))
}

function persistComment(content){
    fetch('http://localhost:3000/comments', {
        method: "POST",
        headers: {"Content-Type":"application/json",
        Accept:"application/json"},
        body: JSON.stringify({movieId: currentMovieNum, content: content})            
    })
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
    let url = `https://api.watchmode.com/v1/title/${movie}/details/?apiKey=BWN7PlyQHdXKacWeTRGyRkrOhSwpcT2XKLuEHgVC`
    
    fetch(url, { method: 'Get' })
    .then((res) => res.json())
    .then((json) => {
        plotTODOM(json)
        getSimilarTitles(json['similar_titles']);
    });
}



function getSimilarTitles (simTitles) {
    similarTitlesBox.replaceChildren()
    for(let i = 0; i < 3; i++){
        fetch(`https://api.watchmode.com/v1/title/${simTitles[i]}/details/?apiKey=BWN7PlyQHdXKacWeTRGyRkrOhSwpcT2XKLuEHgVC`, {method: 'GET'})
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
    console.log(movie)
    plot.textContent = movie['plot_overview']
}


// Below invoking the get movie as soon as page loads

getMovie()


})