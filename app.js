const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//get players details

const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
  SELECT 
    * 
  FROM 
     cricket_team `;
  const playersDetails = await db.all(getPlayersQuery);
  response.send(
    playersDetails.map((eachPlayer) => convertDbObject(eachPlayer))
  );
});

//add player details
app.post("/players/", async (request, response) => {
  const allPlayersDetails = request.body;
  const { playerName, jerseyNumber, role } = allPlayersDetails;
  const addPlayerQuery = `
  INSERT INTO cricket_team (player_name, jersey_number, role)
  VALUES(
      '${playerName}',
       ${jerseyNumber},
      '${role}'
  );`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//get player details based on playerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `SELECT * FROM cricket_team WHERE player_Id=${playerId};`;
  const playerResponse = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObject(playerResponse));
});

//Update player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayersDetails = request.body;
  const { playerName, jerseyNumber, role } = getAllPlayersDetails;

  const updatePlayerDetailsQuery = `
  UPDATE 
    cricket_team
    SET
        player_name= '${playerName}',
        jersey_number= ${jerseyNumber},
        role= '${role}'
    WHERE 
        player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

// Delete Player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE
    FROM 
     cricket_team
     WHERE 
        player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
