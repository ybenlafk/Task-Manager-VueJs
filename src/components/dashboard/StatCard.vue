<script setup lang="ts">
import {
  ClipboardListIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-vue-next";

interface Props {
  title: string;
  value: number;
  icon: "clipboard-list" | "check-circle" | "clock" | "exclamation-circle";
  color: "indigo" | "green" | "yellow" | "red";
}

const props = defineProps<Props>();

const getIcon = () => {
  switch (props.icon) {
    case "clipboard-list":
      return ClipboardListIcon;
    case "check-circle":
      return CheckCircleIcon;
    case "clock":
      return ClockIcon;
    default:
      return ClipboardListIcon;
  }
};

const getColorClasses = () => {
  switch (props.color) {
    case "indigo":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        iconBg: "bg-indigo-100",
      };
    case "green":
      return {
        bg: "bg-green-50",
        text: "text-green-600",
        iconBg: "bg-green-100",
      };
    case "yellow":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        iconBg: "bg-yellow-100",
      };
    case "red":
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        iconBg: "bg-red-100",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-600",
        iconBg: "bg-gray-100",
      };
  }
};

const colorClasses = getColorClasses();
const IconComponent = getIcon();
</script>

<template>
  <div :class="[colorClasses.bg, 'rounded-lg shadow p-6']">
    <div class="flex items-center">
      <div :class="[colorClasses.iconBg, 'p-3 rounded-full']">
        <component
          :is="IconComponent"
          :class="[colorClasses.text, 'h-6 w-6']"
        />
      </div>
      <div class="ml-5">
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p :class="[colorClasses.text, 'text-2xl font-semibold mt-1']">
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>
