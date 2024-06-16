import {Action, ActionPanel, Form, Icon, LocalStorage, showToast, Toast} from "@raycast/api";
import got from "got";

export default function Command() {
  return (
    <Form
    actions={
      <ActionPanel>
        <SendMessage />
      </ActionPanel>
    }
    >
    <Form.TextField id="message" title="Message" placeholder="The message you want to send" />
    <Form.TextField id="userId" title="User ID" placeholder="The user ID of the recipient" />
    </Form>
  );
}

function SendMessage() {
  async function handleSubmit(values: { message: string, userId: string}) {
    if (!values.message) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter a message",
      });
      return;
    }

    const toast = await showToast({
      style:Toast.Style.Animated,
      title: "Sending message",
    });

    try {
      const {body} = await got.post<{message: string}>("http://localhost:3000/send-message", {
        json: {
          message: values.message,
          sessionString: await LocalStorage.getItem("sessionString"),
          userId: values.userId,
        },
        responseType: "json",
      });
    console.log(body); // Log the response body
    toast.style = Toast.Style.Success;
    toast.title = body.message;
    toast.title = "Message sent";
    
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed sending message";
      toast.message = String(error);
      console.log(error);
    }

  }

  return <Action.SubmitForm icon={Icon.Upload} title="Send message" onSubmit={handleSubmit} />;
}