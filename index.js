import axios from "axios"
import express from "express"

const port = 3000 // Port sur lequel le serveur écoutera
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))

const executionTimeStore = []
const INTERVAL = 60000
//let callApiId = 0

const API_KEY = "AIzaSyApOrhAAdI7Szogs147l2UNoM9o8ojCCmY"
const URL = "https://www.voici.fr"

const API_URL = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${URL}&key=${API_KEY}&category=performance&strategy=mobile&_h=1&`

const fetchJsTimeExecution = async (data) => {
  const REGEX = /[A-Z]/i
  let executionJsTime = data.lighthouseResult.audits["bootup-time"].displayValue
  executionJsTime = Number(executionJsTime.replace(REGEX, ""))

  return executionJsTime
}

const getTimeToRequest = () => {
  const date = new Date()

  const mois = (date.getMonth() + 1).toString().padStart(2, "0")
  const jour = date.getDate().toString().padStart(2, "0")
  const heure = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  const time = `${mois}-${jour} ${heure}:${minutes}`
  return time
}

const callAPI = async () => {
  const callApiId = getTimeToRequest()
  const response = await axios.get(API_URL)
  const data = await response.data

  const jsTimeExecution = await fetchJsTimeExecution(data)

  return { jsTimeExecution: jsTimeExecution, idTocalApi: callApiId, data: data }
}

app.get("/", async (req, res) => {
  try {
    const data = await callAPI()
    // time execution Javascript
    const executionJsTime = data.jsTimeExecution
    const idApi = data.idTocalApi
    executionTimeStore.push({ id: idApi, time: executionJsTime })
    // Créer les données Google Chart
    const chartData = executionTimeStore.map((jsTime) => [
      jsTime.id,
      jsTime.time,
    ])
    chartData.unshift(["Par Seb", "Javascript"])

    // file network request
    const networkRequests =
      data.data.lighthouseResult.audits["network-requests"].details.items
    const networkRequestsElements = []
    for (const request of networkRequests) {
      const element = {
        fichier: request.url,
        TempsRequete: request.networkRequestTime,
        type: request.resourceType,
      }

      networkRequestsElements.push(element)
    }

    const longTask =
      data.data.lighthouseResult.audits["long-tasks"].details.items
    const longTasks = []

    for (const task of longTask) {
      const element = {
        fichier: task.url,
        taskTime: task.duration,
      }

      longTasks.push(element)
    }

    //console.log(longTasks)

    res.render("index", {
      chartData: chartData,
      longTasks: longTasks,
      networkRequestsElements: networkRequestsElements,
      url: URL,
    })
  } catch (error) {
    res.status(500).send("Une erreur s'est produite : " + error)
  }
})

app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`)
})
