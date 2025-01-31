$(document).ready(function () {
  var comment = $("form#enquiry textarea"),
    minCommentLength = 1, //set minimum comment length
    $commentValue = comment.val(),
    $commentLength = $commentValue.length,
    submitButton = $("form#enquiry input[type=submit]").hide();

  // $("form")
  //   .prepend('<span class="counter"></span>')
  //   .append('<p class="info">Min length: <span></span></p>');
  // counter = $("span.counter");
  // counter.html(counterValue); //display your set max length
  // comment.attr("maxlength", counterValue); //apply max length to textarea
  // $("form").find("p.info > span").html(minCommentLength);
  // everytime a key is pressed inside the textarea, update counter
  comment.keyup(function () {
    var $this = $(this);
    $commentLength = $this.val().length; //get number of characters
    // counter.html(counterValue - $commentLength); //update counter
    if ($commentLength > minCommentLength - 1) {
      submitButton.fadeIn(200);
    } else {
      submitButton.fadeOut(200);
    }
  });

  $("form").on("submit", function (event) {
    event.preventDefault();
    const rawStory = {
      name: "",
      date: new Date(Date.now()).toISOString().replaceAll(":", "-"),
      user: "aipd",
      model: $("#model").val(),
      story: $("#message").val(),
    };
    console.log(JSON.stringify(rawStory));
    const submitUrl = "http://localhost:3000/addStory";
    $.ajax({
      url: submitUrl,
      type: "post",
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        $("form#enquiry input[type=submit]").hide();
        $(":input", "#enquiry")
          .not(":button, :submit, :reset, :hidden")
          .val("")
          .prop("checked", false)
          .prop("selected", false);
      },
      data: JSON.stringify(rawStory),
    });
  });
});
