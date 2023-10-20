import axios from "axios"
import express from "express"

const port = 3000 // Port sur lequel le serveur écoutera
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))

const API_KEY = "AIzaSyApOrhAAdI7Szogs147l2UNoM9o8ojCCmY"
const URL = "https://www.voici.fr"
//const URL = "https://premier-league-next.vercel.app/"

const API_URL = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${URL}&key=${API_KEY}&category=performance&strategy=mobile&_h=1&`

const callAPI = async () => {
  const response = await axios.get(API_URL)
  const data = await response.data

  return data
}
const data = await callAPI()
app.get("/", async (req, res) => {
  try {
    res.render("index", {
      url: URL,
      data: data.lighthouseResult.audits,
    })
  } catch (error) {
    res.status(500).send("Une erreur s'est produite : " + error)
  }
})

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`)
})
