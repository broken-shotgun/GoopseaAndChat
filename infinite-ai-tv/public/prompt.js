$(document).ready(function () {
  var comment = $("form#enquiry textarea"),
    counter = "",
    counterValue = 5000, //change this to set the max character count
    minCommentLength = 1, //set minimum comment length
    $commentValue = comment.val(),
    $commentLength = $commentValue.length,
    submitButton = $("form#enquiry input[type=submit]").hide();

  $("form")
    .prepend('<span class="counter"></span>')
    .append('<p class="info">Min length: <span></span></p>');
  counter = $("span.counter");
  counter.html(counterValue); //display your set max length
  comment.attr("maxlength", counterValue); //apply max length to textarea
  $("form").find("p.info > span").html(minCommentLength);
  // everytime a key is pressed inside the textarea, update counter
  comment.keyup(function () {
    var $this = $(this);
    $commentLength = $this.val().length; //get number of characters
    counter.html(counterValue - $commentLength); //update counter
    if ($commentLength > minCommentLength - 1) {
      submitButton.fadeIn(200);
    } else {
      submitButton.fadeOut(200);
    }
  });

  $("form").on("submit", function (event) {
    event.preventDefault();
    const shouldContinue = $("#continue").is(":checked");
    const shouldSkipTTS = $("#skiptts").is(":checked");
    const userPrompt = {
      user: $("#author").val(),
      prompt: "",
      skiptts: shouldSkipTTS,
    };
    userPrompt.prompt = $("#message").val();
    console.log(JSON.stringify(userPrompt));
    const submitUrl = shouldContinue
      ? "http://localhost:3000/continue"
      : "http://localhost:3000/addPromptManual";
    $.ajax({
      url: submitUrl,
      type: "post",
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        $(":input", "#enquiry")
          .not(":button, :submit, :reset, :hidden")
          .val("")
          .prop("checked", false)
          .prop("selected", false);
        counter.html(counterValue);
        $("#author").val("aipd");
        $("form#enquiry input[type=submit]").hide();
      },
      data: JSON.stringify(userPrompt),
    });
  });
});
