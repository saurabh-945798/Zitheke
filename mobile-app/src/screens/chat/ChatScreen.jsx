import React, { useState } from "react";
import { View } from "react-native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import ChatBubble from "../../components/chat/ChatBubble";
import ChatInput from "../../components/chat/ChatInput";
import { spacing } from "../../constants/spacing";

const ChatScreen = () => {
  const [value, setValue] = useState("");

  return (
    <ScreenWrapper contentStyle={{ gap: spacing.lg }}>
      <View>
        <ChatBubble message="Hello from Zitheke chat." />
      </View>
      <ChatInput value={value} onChangeText={setValue} onSend={() => setValue("")} />
    </ScreenWrapper>
  );
};

export default ChatScreen;
