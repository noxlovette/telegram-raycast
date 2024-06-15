import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";
import got from "got";

export default function Command() {
  return (
    <Form
      actions={
        <ActionPanel>
          <ShareSecretAction />
        </ActionPanel>
      }
    >
      <Form.TextField id="phone" title="Phone" placeholder="The phone number associated with your TG account" />
    </Form>
  );
}

function ShareSecretAction() {
  async function handleSubmit(values: { phone: string}) {
    if (!values.phone) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter a phone number",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Talking to TG",
    });

    try {
  const { body } = await got.post("http://localhost:3000/auth", {
    json: {
      phone: values.phone,
    },
    responseType: "json",
  });
  console.log(body); // Log the response body
  toast.style = Toast.Style.Success;

Clipboard.copy(`Phone number ${body.phone} reached TG`)

  toast.title = "Sent phone to proxy";
  toast.message = "Copied message to clipboard";
} catch (error) {
  toast.style = Toast.Style.Failure;
  toast.title = "Failed sending to proxy";
  toast.message = String(error);
  console.log(error);
}

  }

  return <Action.SubmitForm icon={Icon.Upload} title="Send Phone" onSubmit={handleSubmit} />;
}