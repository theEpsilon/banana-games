import '../App.css'
import { Link } from "react-router"
import wordleImg from "../assets/wordle_titleimg.png"
import './home.css'
import { Container } from 'react-bootstrap'

function Home() {

  return (
    <Container className='home-container'>
      <div className='mb-5 home-header'>
        <h1>
          Banana Games
        </h1>
      </div>
      <div className='d-flex justify-content-center'>
        <Link to="/wordle">
          <button className='game-button'>
            <img src={wordleImg}></img>
            <div>Wordle</div>
          </button>
        </Link>
      </div>
    </Container>
  )
}

export default Home
