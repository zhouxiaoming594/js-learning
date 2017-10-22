{
  for(let i = 1; i < 5; i++){
    setTimeout(() => {
      console.log(i);
    },0);
  }

  for(var i = 1;i < 5; i++){
    setTimeout((function(i){
        console.log(i);
      })(i),0);     
  }
}