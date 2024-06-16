import React, { useState } from "react";
import { Action, ActionPanel, LocalStorage, Form, Icon, showToast, Toast } from "@raycast/api";
import got from "got";

export default function Command() {
  const [isCodeFieldVisible, setIsCodeFieldVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <Form
      actions={
        <ActionPanel>
          <RequestPhoneCode setIsCodeFieldVisible={setIsCodeFieldVisible} setPhoneNumber={setPhoneNumber} />
          {isCodeFieldVisible && <SendPhoneCode phoneNumber={phoneNumber} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="phone" title="Phone" placeholder="The phone number associated with your TG account" />
      {isCodeFieldVisible && (
        <Form.TextField id="code" title="Code" placeholder="Enter the code you received" />
      )}
    </Form>
  );
}

function RequestPhoneCode({ setIsCodeFieldVisible, setPhoneNumber }: { setIsCodeFieldVisible: React.Dispatch<React.SetStateAction<boolean>>, setPhoneNumber: React.Dispatch<React.SetStateAction<string>> }) {
  async function handleSubmit(values: { phone: string }) {
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
      const { body } = await got.post<{ phone: string }>("http://localhost:3000/send-code", {
        json: {
          phoneNumber: values.phone,

        },
        responseType: "json",
      });
      console.log(body); // Log the response body

      toast.style = Toast.Style.Success;
      toast.title = body.message;
      toast.message = "Please enter the code you received";

      setPhoneNumber(values.phone); // Save the phone number
      setIsCodeFieldVisible(true); // Set state to true to render the code field
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed sending to proxy";
      toast.message = String(error);
      console.log(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Send Phone" onSubmit={handleSubmit} />;
}

function SendPhoneCode({ phoneNumber }: { phoneNumber: string }) {
  async function handleSubmit(values: { code: string }) {
    if (!values.code) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter the code",
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
          phoneNumber: phoneNumber,
          phoneCode: values.code,
        },
        responseType: "json",
      });
      console.log(body); // Log the response body

      toast.style = Toast.Style.Success;

      toast.title = "Logged in";
      toast.message = "Successfully started client";
      await LocalStorage.setItem("phone", phoneNumber); // Save the phone number
      await LocalStorage.setItem("savedSession", body); // Save the code
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to start client";
      toast.message = String(error);
      console.log(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Send Code" onSubmit={handleSubmit} />;
}
