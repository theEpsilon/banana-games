import '../App.css'
import { Link } from "react-router"

function Home() {

  return (
    <div style={{margin: 'auto'}}>
      <h1>
        Banana Games
      </h1>
        <Link to="/wordle">
          <button>
            Wordle
          </button>
        </Link>
    </div>
  )
}

export default Home
