import { getDictValueEnum } from '@/services/system/dict'
import { getMenuTree } from '@/services/system/menu'
import {
  addRole,
  changeRoleStatus,
  exportRole,
  getDeptTreeSelect,
  getRole,
  getRoleList,
  getRoleMenuList,
  removeRole,
  updateRole,
  updateRoleDataScope,
} from '@/services/system/role'
import { formatTreeData } from '@/utils/tree'
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  type ActionType,
  FooterToolbar,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components'
import { FormattedMessage, history, useAccess, useIntl } from '@umijs/max'
import {
  Button,
  Dropdown,
  type FormInstance,
  Modal,
  Space,
  Switch,
  message,
} from 'antd'
import type { DataNode } from 'antd/es/tree'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import DataScopeForm from './components/DataScope'
import UpdateForm from './edit'

const { confirm } = Modal

/**
 * 添加节点
 *
 * @param fields
 */
const handleAdd = async (fields: API.System.Role) => {
  const hide = message.loading('正在添加')
  try {
    const resp = await addRole({ ...fields })
    hide()
    if (resp.code === 200) {
      message.success('添加成功')
    } else {
      message.error(resp.msg)
    }
    return true
  } catch (error) {
    hide()
    message.error('添加失败请重试！')
    return false
  }
}

/**
 * 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: API.System.Role) => {
  const hide = message.loading('正在更新')
  try {
    const resp = await updateRole(fields)
    hide()
    if (resp.code === 200) {
      message.success('更新成功')
    } else {
      message.error(resp.msg)
    }
    return true
  } catch (error) {
    hide()
    message.error('配置失败请重试！')
    return false
  }
}

/**
 * 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.System.Role[]) => {
  const hide = message.loading('正在删除')
  if (!selectedRows) return true
  try {
    const resp = await removeRole(
      selectedRows.map((row) => row.roleId).join(','),
    )
    hide()
    if (resp.code === 200) {
      message.success('删除成功，即将刷新')
    } else {
      message.error(resp.msg)
    }
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}

const handleRemoveOne = async (selectedRow: API.System.Role) => {
  const hide = message.loading('正在删除')
  if (!selectedRow) return true
  try {
    const params = [selectedRow.roleId]
    const resp = await removeRole(params.join(','))
    hide()
    if (resp.code === 200) {
      message.success('删除成功，即将刷新')
    } else {
      message.error(resp.msg)
    }
    return true
  } catch (error) {
    hide()
    message.error('删除失败，请重试')
    return false
  }
}

/**
 * 导出数据
 *
 *
 */
const handleExport = async () => {
  const hide = message.loading('正在导出')
  try {
    await exportRole()
    hide()
    message.success('导出成功')
    return true
  } catch (error) {
    hide()
    message.error('导出失败，请重试')
    return false
  }
}

const RoleTableList: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const formTableRef = useRef<FormInstance>()

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [dataScopeModalOpen, setDataScopeModalOpen] = useState<boolean>(false)

  const actionRef = useRef<ActionType>()
  const [currentRow, setCurrentRow] = useState<API.System.Role>()
  const [selectedRows, setSelectedRows] = useState<API.System.Role[]>([])

  const [menuTree, setMenuTree] = useState<DataNode[]>()
  const [menuIds, setMenuIds] = useState<string[]>([])
  const [statusOptions, setStatusOptions] = useState<any>([])

  const access = useAccess()

  /** 国际化配置 */
  const intl = useIntl()

  useEffect(() => {
    getDictValueEnum('sys_normal_disable').then((data) => {
      setStatusOptions(data)
    })
  }, [])

  const showChangeStatusConfirm = (record: API.System.Role) => {
    const text = record.status === '1' ? '启用' : '停用'
    const newStatus = record.status === '0' ? '1' : '0'
    confirm({
      title: `确认要${text}${record.roleName}角色吗？`,
      onOk() {
        changeRoleStatus(record.roleId, newStatus).then((resp) => {
          if (resp.code === 200) {
            messageApi.open({
              type: 'success',
              content: '更新成功！',
            })
            actionRef.current?.reload()
          } else {
            messageApi.open({
              type: 'error',
              content: '更新失败！',
            })
          }
        })
      },
    })
  }

  const columns: ProColumns<API.System.Role>[] = [
    {
      title: (
        <FormattedMessage id='system.role.role_id' defaultMessage='角色编号' />
      ),
      dataIndex: 'roleId',
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage
          id='system.role.role_name'
          defaultMessage='角色名称'
        />
      ),
      dataIndex: 'roleName',
      valueType: 'text',
    },
    {
      title: (
        <FormattedMessage
          id='system.role.role_key'
          defaultMessage='角色权限字符串'
        />
      ),
      dataIndex: 'roleKey',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id='system.role.role_sort'
          defaultMessage='显示顺序'
        />
      ),
      dataIndex: 'roleSort',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage id='system.role.status' defaultMessage='角色状态' />
      ),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusOptions,
      render: (_, record) => {
        return (
          <Switch
            checked={record.status === '0'}
            checkedChildren='正常'
            unCheckedChildren='停用'
            defaultChecked
            onClick={() => showChangeStatusConfirm(record)}
          />
        )
      },
    },
    {
      title: (
        <FormattedMessage
          id='system.role.create_time'
          defaultMessage='创建时间'
        />
      ),
      dataIndex: 'createTime',
      valueType: 'dateRange',
      render: (_, record) => {
        return <span>{record.createTime.toString()} </span>
      },
      search: {
        transform: (value) => {
          return {
            'params[beginTime]': value[0],
            'params[endTime]': value[1],
          }
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id='pages.searchTable.titleOption'
          defaultMessage='操作'
        />
      ),
      dataIndex: 'option',
      width: '220px',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type='link'
          size='small'
          key='edit'
          icon={<EditOutlined />}
          hidden={!access.hasPerms('system:role:edit')}
          onClick={() => {
            getRoleMenuList(record.roleId).then((res) => {
              if (res.code === 200) {
                console.log(res)
                const treeData = formatTreeData(res.data.menus)
                setMenuTree(treeData)
                setMenuIds(
                  res.data.checkedKeys.map((item) => {
                    return `${item}`
                  }),
                )
                setModalVisible(true)
                setCurrentRow(record)
              } else {
                message.warning(res.msg)
              }
            })
          }}
        >
          编辑
        </Button>,
        <Button
          type='link'
          size='small'
          danger
          key='batchRemove'
          icon={<DeleteOutlined />}
          hidden={!access.hasPerms('system:role:remove')}
          onClick={async () => {
            Modal.confirm({
              title: '删除',
              content: '确定删除该项吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                const success = await handleRemoveOne(record)
                if (success) {
                  if (actionRef.current) {
                    actionRef.current.reload()
                  }
                }
              },
            })
          }}
        >
          删除
        </Button>,
        <Dropdown
          key='more'
          menu={{
            items: [
              {
                label: '数据权限',
                key: 'datascope',
                disabled: !access.hasPerms('system:role:edit'),
              },
              {
                label: '分配用户',
                key: 'authUser',
                disabled: !access.hasPerms('system:role:edit'),
              },
            ],
            onClick: ({ key }: any) => {
              if (key === 'datascope') {
                getRole(record.roleId).then((resp) => {
                  if (resp.code === 200) {
                    setCurrentRow(resp.data)
                    setDataScopeModalOpen(true)
                  }
                })
                getDeptTreeSelect(record.roleId).then((resp) => {
                  if (resp.code === 200) {
                    setMenuTree(formatTreeData(resp.depts))
                    setMenuIds(
                      resp.checkedKeys.map((item: number) => {
                        return `${item}`
                      }),
                    )
                  }
                })
              } else if (key === 'authUser') {
                history.push(`/system/role-auth/user/${record.roleId}`)
              }
            },
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <DownOutlined />
              更多
            </Space>
          </a>
        </Dropdown>,
      ],
    },
  ]

  return (
    <PageContainer>
      {contextHolder}
      <div style={{ width: '100%', float: 'right' }}>
        <ProTable<API.System.Role>
          headerTitle={intl.formatMessage({
            id: 'pages.searchTable.title',
            defaultMessage: '信息',
          })}
          actionRef={actionRef}
          formRef={formTableRef}
          rowKey='roleId'
          key='roleList'
          search={{
            labelWidth: 120,
          }}
          toolBarRender={() => [
            <Button
              type='primary'
              key='add'
              hidden={!access.hasPerms('system:role:add')}
              onClick={async () => {
                getMenuTree().then((res: any) => {
                  if (res.code === 200) {
                    const treeData = formatTreeData(res.data)
                    setMenuTree(treeData)
                    setMenuIds([])
                    setModalVisible(true)
                    setCurrentRow(undefined)
                  } else {
                    message.warning(res.msg)
                  }
                })
              }}
            >
              <PlusOutlined />{' '}
              <FormattedMessage
                id='pages.searchTable.new'
                defaultMessage='新建'
              />
            </Button>,
            <Button
              type='primary'
              key='remove'
              hidden={
                selectedRows?.length === 0 ||
                !access.hasPerms('system:role:remove')
              }
              onClick={async () => {
                Modal.confirm({
                  title: '是否确认删除所选数据项?',
                  icon: <ExclamationCircleOutlined />,
                  content: '请谨慎操作',
                  async onOk() {
                    const success = await handleRemove(selectedRows)
                    if (success) {
                      setSelectedRows([])
                      actionRef.current?.reloadAndRest?.()
                    }
                  },
                  onCancel() {},
                })
              }}
            >
              <DeleteOutlined />
              <FormattedMessage
                id='pages.searchTable.delete'
                defaultMessage='删除'
              />
            </Button>,
            <Button
              type='primary'
              key='export'
              hidden={!access.hasPerms('system:role:export')}
              onClick={async () => {
                handleExport()
              }}
            >
              <PlusOutlined />
              <FormattedMessage
                id='pages.searchTable.export'
                defaultMessage='导出'
              />
            </Button>,
          ]}
          request={(params) =>
            getRoleList({ ...params } as API.System.RoleListParams).then(
              (res) => {
                const result = {
                  data: res.data.list,
                  total: res.data.total,
                  success: true,
                }
                return result
              },
            )
          }
          columns={columns}
          rowSelection={{
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows)
            },
          }}
        />
      </div>
      {selectedRows?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage
                id='pages.searchTable.chosen'
                defaultMessage='已选择'
              />
              <a style={{ fontWeight: 600 }}>{selectedRows.length}</a>
              <FormattedMessage
                id='pages.searchTable.item'
                defaultMessage='项'
              />
            </div>
          }
        >
          <Button
            key='remove'
            hidden={!access.hasPerms('system:role:del')}
            onClick={async () => {
              Modal.confirm({
                title: '删除',
                content: '确定删除该项吗？',
                okText: '确认',
                cancelText: '取消',
                onOk: async () => {
                  const success = await handleRemove(selectedRows)
                  if (success) {
                    setSelectedRows([])
                    actionRef.current?.reloadAndRest?.()
                  }
                },
              })
            }}
          >
            <FormattedMessage
              id='pages.searchTable.batchDeletion'
              defaultMessage='批量删除'
            />
          </Button>
        </FooterToolbar>
      )}
      <UpdateForm
        onSubmit={async (values) => {
          let success = false
          if (values.roleId) {
            success = await handleUpdate({ ...values } as API.System.Role)
          } else {
            success = await handleAdd({ ...values } as API.System.Role)
          }
          if (success) {
            setModalVisible(false)
            setCurrentRow(undefined)
            if (actionRef.current) {
              actionRef.current.reload()
            }
          }
        }}
        onCancel={() => {
          setModalVisible(false)
          setCurrentRow(undefined)
        }}
        open={modalVisible}
        values={currentRow || {}}
        menuTree={menuTree || []}
        menuCheckedKeys={menuIds || []}
        statusOptions={statusOptions}
      />
      <DataScopeForm
        onSubmit={async (values: any) => {
          const success = await updateRoleDataScope(values)
          if (success) {
            setDataScopeModalOpen(false)
            setSelectedRows([])
            setCurrentRow(undefined)
            message.success('配置成功。')
          }
        }}
        onCancel={() => {
          setDataScopeModalOpen(false)
          setSelectedRows([])
          setCurrentRow(undefined)
        }}
        open={dataScopeModalOpen}
        values={currentRow || {}}
        deptTree={menuTree || []}
        deptCheckedKeys={menuIds || []}
      />
    </PageContainer>
  )
}

export default RoleTableList
