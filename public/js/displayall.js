(function($){

//   $.ajaxSetup({ cache: false });

    $("#Button1").on( 'click', function( event ) {
        AddItem();
    });

    $("#GetPriceButton").on( 'click', function( event ) {
        GetPrices();
    });
    
    $("#DeleteButton").on( 'click', function( event ) {
        DeleteAll();
    });
    
    $(document).ready(function($){ 
        FillTable();
    });
    
})(jQuery);

function FillTable() {
    var ctx = window.location.pathname;
    ctx = ctx.substring(0, ctx.lastIndexOf("/"));
    ctx = ctx.substring(0, ctx.lastIndexOf("/") + 1);
    var url = ctx + "commands/getitems";
    $.get( url, function( data ){
    	var items = data;
    	$('#itemcount').text(items.length);
    	for (var i=0; i < items.length; i++) {
    		$("#itemtable").append("<tr><td>" + items[i].name + "</td>" +
									   "<td>" + items[i].url + "</td>" +
									   "<td>" + items[i].pricetag + "</td>" +
									   "<td>" + items[i].price + "</td>" +
									 "</tr>");
    	}
    });
}

function GetPrices() {
    var ctx = window.location.pathname;
    ctx = ctx.substring(0, ctx.lastIndexOf("/"));
    ctx = ctx.substring(0, ctx.lastIndexOf("/") + 1);
    var url = ctx + "commands/getprices";
    window.location = url;
}

function DeleteAll() {
    var ctx = window.location.pathname;
    ctx = ctx.substring(0, ctx.lastIndexOf("/"));
    ctx = ctx.substring(0, ctx.lastIndexOf("/") + 1);
    var url = ctx + "commands/clearall";
    window.location = url;
}