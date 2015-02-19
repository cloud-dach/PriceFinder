(function($){

//   $.ajaxSetup({ cache: false });

    $("#Button1").on( 'click', function( event ) {
        AddItem();
    });

})(jQuery);

function AddItem() {
    var ctx = window.location.pathname;
    ctx = ctx.substring(0, ctx.lastIndexOf("/"));
    ctx = ctx.substring(0, ctx.lastIndexOf("/") + 1);
    var url = ctx + "commands/additem";
    // console.log(ctx);
    var ItemName = $('[name="name"]').val();
    var ItemUrl = $('[name="url"]').val();
    console.log("test: ", url);
    $.get( url, { Name:ItemName, Url:ItemUrl} , function( data ){
    	console.log(data);
      alert("item added");
    })
      .fail(function() {
        alert("could not add item")
      });
}