var $form = $('.register');

function validateEmail(email) {
	var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regex.test(email);
};

$form.on('keyup', 'input', function(e) {
	var $this = $(this),
		$input = $this.val();
	if ($input.length > 0) {
		$form.find('label').addClass('active');
		if (validateEmail($input)) {
			$form.find('button').addClass('active');
			console.log(e);
			if (e.which === 13) {
				$form.find('button').click();
				$this.blur();
			}
		} else {
			$form.find('button').removeClass('active');
		}
		$(this).addClass('active');
	} else {
		$form.find('label').removeClass('active');
		$form.find('button').removeClass('active');
		$(this).removeClass('active');
	}
});

$form.on('click', 'button.active', function(e) {
	e.preventDefault;
	var $this = $(this);
	$(this).addClass('full');
	$(this).html('Thanks!');
    var data = {
        email: $form.find('input').val(),
        token: location.search.substring(1)
    };
	$.post('/', data, (data) => {
        setTimeout(() => {
            // TODO remove form and display message
            $form.html('');
            if (data.code == 'OK') {
                location = data.url;
            } else {
                $form.html(data.code);
                alert(data.code);
            }
        }, 2500);
	});
})
