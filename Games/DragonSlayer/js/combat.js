
//File contains all the relevant functions to building the combat system in the game

// Function Names
// pushText(text)
// fieldOfView()
// showEnemy()
// updatePlayerText()
// disableAllButtons()
// enableCombatButtons()
// playerHit()
// playerCrit()
// playerRun()
// enemyHit()
// enemyCrit()
// enemyEncounter()
// enemySelect()
// playerAttack()
// enemyAttack()
// playerRetreat()
// playerSleep()
// foundBoss()
// resetBoss()
// copyEnemy(data)
// resetPlayer()
// usePotion()


//Pushes text to the text box
const pushText = (text) => {
  //Pushes text to the scrolling text box
  $("#textBox").html( $("#textBox").html() + text);
}

//Generates the new field of view
//The player can only see seven squares to the left and right of them
//and four squares up and down of them
//Creating a 15x9 square which is their field of view
const fieldOfView = () => {
  //Hide the enemy image and the current field of view
  $("#enemyBox").hide();
  $(".square").hide();

  //Render the squares around the player
  for(let i = playerPos[0] - 7; i <= playerPos[0] + 7; i++){
    for(let x = playerPos[1] - 4; x <= playerPos[1] + 4; x++){
      $(`#${i}-${x}`).show();
    }
  }

  //Moves the player's icon to their new position
  $playerImg.appendTo( $(`#${playerPos[0]}-${playerPos[1]}`) );
}

//Function is used when the player enters combat
//Function hides the current field of view then displays the current enemy image
const showEnemy = () => {
  $(".square").hide();
  $("#enemyBox").show();
  $("#enemyImg").attr("src", enemyChar.image);
}

//Function that updates all of the player text in the HUD
const updatePlayerText = () => {
  $("#playerHealth").text( playerChar.health );
  $("#playerPotions").text( playerChar.potions );
}

//Disables all the movement and combat buttons
//Used after the player has won or lost the game
const disableAllButtons = () => {
  $("#attackButton").off();
  $("#healButton").off();
  $("#retreatButton").off();
  $("#sleepButton").off();
  $("#upButton").off();
  $("#downButton").off();
  $("#leftButton").off();
  $("#rightButton").off();
}

//Enables combat buttons
//When the user clicks on a combat button it also pushes combat forward
const enableCombatButtons = () => {
  //When the user clicks on the ATTACK button
  $("#attackButton").on("click", () => {
    //If the player is in combat, the player then attacks the enemy
    if(playerChar.inCombat){
      playerAttack();
      //If the player is still in combat after attacking (because the enemy is still alive)
      //Then the enemy attacks the player
      if(playerChar.inCombat){
        enemyAttack();
      }
    //If the player is NOT in combat, push a message telling them they can't attack right now
    } else {
      pushText("You can not do that right now.<br><br>");
    } } );

  //When the user clicks on the HEAL button
  $("#healButton").on("click", () => {
    //Check to see if the player is in combat
    //If he is, let the player (try) to heal, then let the enemy attack the player
    if(playerChar.inCombat){
      usePotion();
      enemyAttack();
    //If the player is NOT in combat, push a message telling them they can't heal right now
    } else {
      pushText("You can not do that right now.<br><br>");
    } } );

  //When the user clicks on the RETREAT button
  $("#retreatButton").on("click", () => {
    //If the player is in combat, let them try to retreat
    if(playerChar.inCombat){
      playerRetreat();
      //If the player is still in combat (because they failed to run), let the enemy attack the player
      if(playerChar.inCombat){
        enemyAttack();
      }
    //If the player is NOT in combat, push a message telling them they can't retreat right now
    } else {
      pushText("You can not do that right now.<br><br>");
    } } );

  //When the player clicks on the sleep button, let them heal, but only if they're not in combat
  $("#sleepButton").on("click", playerSleep);
}

//Function to determine if the player has landed a hit or not
const playerHit = () => {
  return Math.random() < playerChar.acc;
}

//Function to determine if the player has landed a critical strike or not
const playerCrit = () => {
  return Math.random() < playerChar.crit;
}

//Function to determine if the player has managed to run away
const playerRun = () => {
  return Math.random() < playerChar.run;
}

//Function to determine if the enemy has landed a hit or not
const enemyHit = () => {
  return Math.random() < enemyChar.acc;
}

//Function to determine if the enemy has landed a critical strike or not
const enemyCrit = () => {
  return Math.random() < enemyChar.crit;
}

//Function to determine if the player has run into a random encounter
const enemyEncounter = () => {
  return Math.random() < .075;
}

//Function to determine who the player ran into during a random encounter
const enemySelect = () => {
  const myNum = Math.floor(Math.random() * 5);

  // 20% chance to see a skeleton, 40% chance to see a slime, 40% chance to see a wizard
  switch(myNum){
    case 0: return skeleton;
    case 1:
    case 2: return wizard;
    default: return slime;
  }
}

//When the player decides to attack
const playerAttack = () => {
  //If the player lands a hit on the enemy
  pushText(`You took a swing and`);
  // pushText(`You took a swing at the ${enemyChar.name} and`);

  //If the player lands a hit
  if(playerHit()){
    //If the player lands a critical hit on the enemy it deals 3x damage
    if(playerCrit()){
      pushText(`....CRITICAL STRIKE!!!  You dealt ${playerChar.attack * 3} damage!<br>`);
      enemyChar.health -= playerChar.attack * 3;

    //If the player deals regular damage to the enemy
    } else {
      pushText(`....you landed a blow, dealing ${playerChar.attack} damage!<br>`);
      enemyChar.health -= playerChar.attack;
    }

    //Check to see if the player has won
    if(enemyChar.health <= 0){
      //If the player just beat the boss
      //Disable all the buttons and congradulate the player
      if(enemyChar.isBoss){
        playerChar.inCombat = false;
        fieldOfView();
        disableAllButtons();
        pushText("<br>You have slayed the dragon and resuced the princess!  Your epic tale will be told for generations to come!<br>");

      //If the player just beat a regular enemy
      //Congradulate the player and remove them from combat
      } else {
        playerChar.inCombat = false;
        pushText(`You have slain ${enemyChar.name}. Good riddance.<br><br>`);
        fieldOfView();
      }
    }

  //If the player missed their attack
  } else {
    pushText("....and missed!<br>");
  }
}

//Enemy's attack turn
const enemyAttack = () => {
  pushText(`The ${enemyChar.name} attacks and`);

  //If the enemy hit the player
  if(enemyHit()){
    //If the enemy lands a critical strike
    if(enemyCrit()){
      pushText(`....CRITICAL STRIKE!!!  You took ${enemyChar.attack * 3} damage!<br>`);
      playerChar.health -= enemyChar.attack * 3;
    //Of if the enemy landed a regular attack
    } else {
      pushText(`....lands a blow!  You took ${enemyChar.attack} damage!<br>`);
      playerChar.health -= enemyChar.attack;
    }

    //Update the player HUD with his new health value
    updatePlayerText();

    //If the player has died
    if(playerChar.health <= 0){
      //Disable all buttons and push a message telling the player they have died
      disableAllButtons();
      pushText("<br>You have died heroicly in battle.  Unfortunately the Dragon is still alive and begins a new age of darkness that will last for one hundred years!");

      //Remove the player icon from the map
      $(`#${playerPos[0]}-${playerPos[1]}`).empty();
    }

  //When the enemy misses
  } else {
    pushText(`....misses!<br>`);
  }
}

//Function where the player runs away from battle
//If they're successful, alert them and remove them from combat
//Otherwise just alert them of their failure.
const playerRetreat = () => {
  pushText("You tried to run away and...");

  if(playerRun()){
    pushText("...managed to get away.<br><br>");
    playerChar.inCombat = false;
    fieldOfView();
  } else {
    pushText("...failed to get away.<br>");
  }
}

//Function used when the player tries to sleep
//If the player is in combat, push a message telling them they can't do that right now
//Other wise fully heal the player and update their HUD
const playerSleep = () => {
  if(playerChar.inCombat){
    pushText("You can not sleep with a monster in front of you.<br>");
  } else {
    pushText("You rest through the night and restore all of your health.<br><br>");
    playerChar.health = playerChar.maxHealth;
    updatePlayerText();
  }
}

//Function used to determine if the player has found the boss
//Returns true if the boss and player are on the same square
//Otherwise returns false
const foundBoss = () => {
  return bossChar.position === `${playerPos[0]}-${playerPos[1]}`;
}

//Resets the boss health and gives him a random position on the map
const resetBoss = () => {
  //Default max health for the boss
  // bossChar.health = 100;

  //Pull all the town squares and set the boss to a random one
  //If the boss is set to the player's initial position, call this function to try again
  const $myTowns = $(".towns");
  const townNumber = Math.floor(Math.random() * $myTowns.length);
  if( `${playerPos[0]}-${playerPos[1]}` === $myTowns.eq(townNumber).attr("id") ){
    resetBoss();
  } else {
    //Boss is not at initial player position so set his location
    bossChar.position = $myTowns.eq(townNumber).attr("id");
  }
}

//Copys an enemy's data to the enemyChar class
const copyEnemy = (data) => {
  enemyChar.name = data.name;
  enemyChar.health = data.health;
  enemyChar.attack = data.attack;
  enemyChar.acc = data.acc;
  enemyChar.crit = data.crit;
  enemyChar.isBoss = data.isBoss;
  enemyChar.image = data.image;
}


//Reset the player to max health and potions
//Then reset the boss
//Then update the player text in the HUD
//Reset the player attack in case they use EasyMode
//Update the player text in case they use HardMode
const resetPlayer = () => {
  playerChar.health = playerChar.maxHealth;
  playerChar.potions = playerChar.maxPotions;
  playerChar.inCombat = false;
  playerChar.attack = 10;
  fieldOfView();
  resetBoss();
  updatePlayerText();
}

//Function used when the player tries to use a potion
//If the player has a potion, heal the player to max health, subtract a potion, and update the players HUD
//If the player does not have a potion, push a message telling them that they wasted their time
const usePotion = () => {
  if(playerChar.potions > 0){
    pushText("You used a healing potion to restore your health.<br>");
    playerChar.health = playerChar.maxHealth;
    playerChar.potions--;
    updatePlayerText();
  } else {
    pushText("You look for a potion, but alas you just wasted your time for you have no more potions.<br>");
  }
}
