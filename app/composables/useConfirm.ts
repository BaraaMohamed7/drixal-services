import { defineComponent, h } from "vue";
import { UButton, UModal } from "#components";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
};

const ConfirmModal = defineComponent({
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    confirmLabel: { type: String, required: true },
    cancelLabel: { type: String, required: true },
  },
  emits: ["update:open", "close"],
  setup(props, { emit }) {
    const close = (value: boolean) => emit("close", value);
    return () =>
      h(
        UModal,
        {
          title: props.title,
          description: props.description,
          open: props.open,
          dismissible: false,
          "onUpdate:open": (value: boolean) => {
            if (!value) close(false);
          },
        },
        {
          footer: () =>
            h("div", { class: "flex justify-end gap-2" }, [
              h(UButton, { label: props.cancelLabel, color: "neutral", variant: "soft", onClick: () => close(false) }),
              h(UButton, { label: props.confirmLabel, onClick: () => close(true) }),
            ]),
        },
      );
  },
});

export const useConfirm = () => {
  const overlay = useOverlay();
  const instance = overlay.create(ConfirmModal, { destroyOnClose: true });

  const open = async (options: ConfirmOptions) => {
    const result = await instance.open(options);
    return result !== false;
  };

  return { open };
};
