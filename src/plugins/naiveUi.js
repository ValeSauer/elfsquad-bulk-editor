// Wrapper für Naive UI, falls später weitere Plugins ergänzt werden
import { create, NButton, NInput, NTag, NDataTable, NTree, NCheckbox, NDialogProvider, NMessageProvider, NSelect, NModal, NForm, NFormItem, NAutoComplete, NAlert, NSpin, NDivider, NTooltip, NIcon, NPagination, NBadge, NDropdown, NConfigProvider, NCard, NCollapse, NCollapseItem, NResult, NLoadingBarProvider, NAvatar, NText, NScrollbar, NBackTop, NGrid, NGridItem, NRadioGroup, NRadio, NTabPane, NTabs, NUpload, NProgress, NDatePicker, NTimePicker, NInputNumber, NSpace, NPopover, NMenu, NLayout, NLayoutSider, NLayoutContent, NLayoutHeader, NLayoutFooter } from 'naive-ui'

export function createNaiveUi() {
  return create({
    components: [
      NButton, NInput, NTag, NDataTable, NTree, NCheckbox, NDialogProvider, NMessageProvider, NSelect, NModal, NForm, NFormItem, NAutoComplete, NAlert, NSpin, NDivider, NTooltip, NIcon, NPagination, NBadge, NDropdown, NConfigProvider, NCard, NCollapse, NCollapseItem, NResult, NLoadingBarProvider, NAvatar, NText, NScrollbar, NBackTop, NGrid, NGridItem, NRadioGroup, NRadio, NTabPane, NTabs, NUpload, NProgress, NDatePicker, NTimePicker, NInputNumber, NSpace, NPopover, NMenu, NLayout, NLayoutSider, NLayoutContent, NLayoutHeader, NLayoutFooter
    ]
  })
}
