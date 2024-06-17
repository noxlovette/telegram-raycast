import {Action, ActionPanel, Form, Icon, launchCommand, LaunchType, LocalStorage, showToast, Toast} from "@raycast/api";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export default function Command() {
  return (
    <Form
    actions={
      <ActionPanel>
        <SendMessage />
      </ActionPanel>
    }
    >
    <Form.TextArea id="message" title="Message" placeholder="The message you want to send" />
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
    } else if (!values.userId) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter a user ID",
      });
      return;
    }

    const toast = await showToast({
      style:Toast.Style.Animated,
      title: "Sending message",
    });

    try {
      const savedSession:string = await LocalStorage.getItem("savedSession") || "";
      const SESSION = new StringSession(savedSession);

if (!savedSession) {
  await launchCommand({name: "telegram-login", type: LaunchType.UserInitiated, context: {message: "Log in to begin"}});
  return;
}

      const client = new TelegramClient(SESSION, 12345678, 'api_hash', { connectionRetries: 5 });
      await client.connect();
      const message = values.message;
      await client.sendMessage(`${values.userId}`, {message});
    
    toast.style = Toast.Style.Success;
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