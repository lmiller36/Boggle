
function startSingleGame(){
   document.isSinglePlayerGame = true;
   game();
} 
function changeTimeSingle(change){
   var time = document.setupTime / 60000;
   var minTime = 1;
   time += change;
   if(time > minTime) time = Math.min(10,time);
   else time = minTime;

   setClock(time,0,"clockdiv_setup");

   document.setupTime = time * 60000;
}  

function mainMenu_setupSingle(){
      // Go to main menu
     mainMenu();
}
