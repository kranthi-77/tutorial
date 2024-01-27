const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
module.exports = app
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//get api
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
app.get('/players/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team`
  const playersArray = await db.all(getBooksQuery)

  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//post api

app.post('/players/', async (request, response) => {
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const postquery = `
    INSERT INTO
    cricket_team (player_name,jersey_number,role)
    VALUES
    (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    )
  `
  let dbresponse = await db.run(postquery)
  response.send('Player added to team')
})

//get id api

app.get('/players/:playerId/', async (request, response) => {
  const playerId = request.params
  const playeriddetails = request.body
  const getidquery = `
    select
    *
    from cricket_team
    where 
    player_id = '${playerId}'
  `
  const dbresponse = await db.all(getidquery)
  response.send(dbresponse)
})

//put api

app.put('/players/:playerId/', async (request, response) => {
  const player_id = request.params
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const updatequery = `
   UPDATE 
   cricket_team
   SET
   player_name = '${playerName}',
   jersey_number = ${jerseyNumber},
   role = '${role}'
   where player_id = ${playerId}
   `
  await db.run(updatequery)
  response.send('Player Details Updated')
})

//delete api
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deleteBookQuery)
  response.send('Player Removed ')
})
