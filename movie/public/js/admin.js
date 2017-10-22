$(function() {
	$('.del').click(function(e) {
		var target = $(e.target);
		var id = target.data('id');
		var cid = target.data('category');
		var tr = $('.item-id-' + id);
		$.ajax({
			type: 'DELETE',
			url: '/admin/movie/list?id=' + id + '&cid=' + cid
		})
		.done(function(result){
			if(result.success === 1){
				if(tr.length > 0){
					tr.remove();
				}
			}
		});
	});

	$('#douban').blur(function(e) {
		var target = $(e.target);
		var id = target.val();
		if (id !== '') {
			$.ajax({
				type: 'GET',
				url: 'https://api.douban.com/v2/movie/subject/' + id,
				cache: true,
				dataType: 'jsonp',
				jsonp: 'callback'
			}).done(function(date){
					$('#inputTitle').val(date.title);
					$('#inputDoctor').val(date.directors[0].name);
					$('#inputCountry').val(date.countries[0]);
					$('#inputPoster').val(date.images.large);
					$('#inputYear').val(date.year);
					$('#inputSummary').val(date.summary);
			}).fail(function(err){
					console.log(err);
			})
		}
	})
})