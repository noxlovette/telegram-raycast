import React, { useState } from "react";
import { Action, ActionPanel, LocalStorage, Form, Icon, showToast, Toast, getPreferenceValues, launchCommand, LaunchType } from "@raycast/api";
import got from "got";

export default function Command() {
  const [isCodeFieldVisible, setIsCodeFieldVisible] = useState(false);

  let currentAction = <RequestPhoneCode setIsCodeFieldVisible={setIsCodeFieldVisible} />;
  let currentFields = undefined;
  if (isCodeFieldVisible) {
    currentAction = <SendPhoneCode />;
    currentFields = (
      <>
        <Form.TextField id="code" title="Code" placeholder="Enter the code you received" />
        <Form.PasswordField id="password" title="Password" placeholder="Enter the password IF you have set one" />
      </>
    );
  }

  return (
    
    <Form
    searchBarAccessory={
      <Form.LinkAccessory
        target="https://github.com/noxlovette/telegram-raycast/"
        text="Open Documentation"
      />
    }

    navigationTitle="Telegram Login"

      actions={
        <ActionPanel>
          {currentAction}
        </ActionPanel>
      }
    >
      {currentFields}
      <Form.Description
        title="Log into Telegram"
        text="This command will log you into Telegram. The fields will render as you progress. Your phone number is ready to be sent."
      />
    </Form>
  );
}

function RequestPhoneCode({ setIsCodeFieldVisible }: { setIsCodeFieldVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
  async function handleSubmit() {
    const {phoneNumber} = getPreferenceValues<ExtensionPreferences>(); // Replace with the actual phone number

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Talking to TG",
    });

    try {
      const { body } = await got.post<{ message: string }>("http://localhost:3000/send-code", {
        json: {
          phoneNumber: phoneNumber,
        },
        responseType: "json",
      });
      console.log(body); // Log the response body

      toast.style = Toast.Style.Success;
      toast.title = body.message;
      toast.message = "Please enter the code you received";

      LocalStorage.setItem("phone", phoneNumber); // Save the phone number
      setIsCodeFieldVisible(true); // Set state to true to render the code field
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed sending to proxy";
      toast.message = String(error);
      console.log(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Request Code" onSubmit={handleSubmit} />;
}

function SendPhoneCode() {
  async function handleSubmit(values: { code: string, password: string}) {
    if (!values.code) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter the code",
      });
      return;
    } else if (values.code.length !== 5) {
      showToast({
        style: Toast.Style.Failure,
        title: "Invalid code",
        message: "Please enter a 5-digit code",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Sending code to TG",
    });

    try {
      const { body } = await got.post("http://localhost:3000/start-client", {
        json: {
          phoneNumber: await LocalStorage.getItem("phone"), // Get the phone number from local storage
          password: values.password || "",
          phoneCode: values.code,
        },
        responseType: "json",
      });

      toast.style = Toast.Style.Success;
      toast.title = "Logged in";
      toast.message = "Successfully started client";
      await LocalStorage.clear(); // Clear the phone number and phone code
      await LocalStorage.setItem("savedSession", body.savedSession); // save the session string for later use
      await launchCommand({name: "telegram-send-message", type: LaunchType.UserInitiated, context: {message: "You are all set!"}});
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to start client";
      toast.message = String(error);
      console.log(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Send Code" onSubmit={handleSubmit} />;
}