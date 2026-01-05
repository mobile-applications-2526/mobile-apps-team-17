import { Idea } from "@/types/index";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Dropdown from "./Dropdown";
import DropdownIcon from "../assets/images/back-icon.png";
import BellActiveIcon from "../assets/images/bell-active-icon.png";
import BellIcon from "../assets/images/bell-icon.png";
import CommentActiveIcon from "../assets/images/comment-active-icon.png";
import CommentIcon from "../assets/images/comment-icon.png";

type Props = {
  idea: Idea;
  initialIsFollowing: boolean;
  isCommentActive?: boolean;
  isManager?: boolean;
  isFollowLoading?: boolean;
  onComment?: () => void;
  onFollow?: (isCurrentlyFollowing: boolean) => Promise<void>;
  onChangeStatus?: (newStatus: string) => Promise<void>;
};

const IdeaCard: React.FC<Props> = ({
  idea,
  initialIsFollowing,
  isCommentActive = false,
  isManager = false,
  isFollowLoading = false,
  onComment,
  onFollow,
  onChangeStatus,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(idea.status);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);


  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollowPress = async () => {
    if (onFollow) {
      const newState = !isFollowing;
      setIsFollowing(newState);

      try {
        await onFollow(isFollowing);
      } catch (error) {
        console.error("Failed to update follow status:", error);
        setIsFollowing(!newState);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Now";
    if (diffHours < 1) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";

    return `${diffDays} days ago`;
  };

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = `${date.getDate()}`.padStart(2, "0");
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const reviewDate = formatReviewDate(
    (idea as any).review_date ?? idea.created_at
  );

  useEffect(() => {
    setCurrentStatus(idea.status);
  }, [idea.status]);

  const capitalizeStatus = (status: string) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const openStatusModal = (status: string) => {
    setPendingStatus(status);
    setIsStatusModalVisible(true);
  };

  const handleConfirmStatus = async () => {
    if (!pendingStatus) {
      setIsStatusModalVisible(false);
      return;
    }

    const previousStatus = currentStatus;
    const newStatus = pendingStatus;

    setCurrentStatus(newStatus);
    setIsStatusModalVisible(false);

    if (onChangeStatus) {
      try {
        await onChangeStatus(newStatus);
      } catch (error) {
        console.error("Failed to change status:", error);
        setCurrentStatus(previousStatus);
      }
    }
    
    setPendingStatus(null);
  };

  const handleCancelStatus = () => {
    setPendingStatus(null);
    setIsStatusModalVisible(false);
  };

  const displayPendingStatus = capitalizeStatus(pendingStatus || currentStatus);
  const currentStatusLabel =
    currentStatus === "accepted" || currentStatus === "declined"
      ? capitalizeStatus(currentStatus)
      : currentStatus === "commented by manager"
        ? "Commented by manager"
        : `Review date: ${reviewDate}`;
  const statusOptions = ["accepted", "declined"]
    .filter((status) => status !== currentStatus)
    .map((status) => ({
      label: capitalizeStatus(status),
      value: status,
    }));
  
  return (
    <View className="mb-1.5">
    <View className="flex-column gap-0.5 mx-4">
      <View className="bg-white rounded-[10px] border border-brand-black p-3 mb-1">
        <Text className="text-gray-500 text-xs mb-1">
          {formatDate(idea.created_at)}
        </Text>

        {idea.subject && (
          <Text
            className="text-brand-black text-lg font-semibold mb-1"
            testID="idea-card-subject"
          >
            {idea.subject}
          </Text>
        )}

        <Text
          className="text-brand-black text-lg leading-5 mb-1"
          testID="idea-card-description"
        >
          {idea.description}
        </Text>
      </View>

      <View className="flex-row items-center gap-1.5">
       <View className="relative w-3/5">
          {isManager ? (
            <Dropdown
              disabled={!isManager}
              options={statusOptions}
              onSelect={openStatusModal}
              iconSource={DropdownIcon}
              triggerContent={
                <Text className="text-brand-blue text-sm font-semibold text-center">
                  {currentStatusLabel}
                </Text>
              }
            />
          ) : (
            <View className="bg-white border-[1px] border-brand-black rounded-[10px] px-4 py-2">
              <View className="flex-row items-center">
                <View className="flex-1 items-center">
                  <Text className="text-brand-blue text-sm font-semibold text-center">
                    {currentStatusLabel}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View className="flex-1 flex-row gap-1.5">
          <View
            className={`flex-1 border rounded-[10px] ${
              isCommentActive
                ? "border-brand-blue bg-brand-blue"
                : "border-brand-black bg-white"
            }`}
          >
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 px-2 py-2"
              onPress={onComment}
              activeOpacity={0.7}
              testID="idea-card-comment-button"
            >
              <Image
                source={isCommentActive ? CommentActiveIcon : CommentIcon}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          </View>

          <View
            className={`flex-1 border rounded-[10px] ${
              isFollowLoading
                ? "border-brand-black bg-white"
                : isFollowing
                ? "border-brand-blue bg-brand-blue"
                : "border-brand-black bg-white"
            }`}
          >
            <TouchableOpacity
              className="flex-row items-center justify-center px-2 py-2"
              onPress={handleFollowPress}
              activeOpacity={0.7}
              disabled={isFollowLoading}
              testID="idea-card-follow-button"
            >
              {isFollowLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#1877F2"
                  testID="idea-card-follow-loading"
                />
              ) : (
                <Image
                  source={isFollowing ? BellActiveIcon : BellIcon}
                  style={{ width: 20, height: 20 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    
      <Modal
        visible={isStatusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelStatus}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="w-9/12 bg-white rounded-[20px] p-5">
            <Text className="text-center text-base font-semibold mb-4">
              Changing this post&apos;s status
            </Text>

            <Text className="text-center text-brand-blue text-xl font-bold mb-2">
              {currentStatusLabel}
            </Text>

            <View className="items-center mb-2">
              <Image
                source={DropdownIcon}
                style={{ width: 28, height: 28, transform: [{ rotate: "-90deg" }] }}
                resizeMode="contain"
              />
            </View>

            <Text className="text-center text-brand-blue text-xl font-bold mb-6">
              {displayPendingStatus}
            </Text>

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 bg-brand-blue rounded-[16px] py-3 items-center"
                onPress={handleConfirmStatus}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-semibold">
                  Confirm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 border border-gray-400 rounded-[16px] py-3 items-center"
                onPress={handleCancelStatus}
                activeOpacity={0.8}
              >
                <Text className="text-gray-600 text-base font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default IdeaCard;
