import { useQuery, gql, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import { updateWithdrawReqStatus, withdrawRequestQuery } from '../apollo'
import Header from '../components/Headers/Header'
import { Box, Container, MenuItem, Select } from '@mui/material'
import { customStyles } from '../utils/tableCustomStyles'
import useGlobalStyles from '../utils/globalStyles'
import SearchBar from '../components/TableHeader/SearchBar'
import { ReactComponent as WithdrawIcon } from '../assets/svg/svg/Request.svg'
import TableHeader from '../components/TableHeader'
import { withTranslation, useTranslation } from 'react-i18next'

const GET_ALL_WITHDRAW_REQUEST = gql`
  ${withdrawRequestQuery}
`

function WithdrawRequest() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handlePageChange = (currentPage) => {
    setPage(currentPage - 1) // DataTable uses 1-based indexing
  }

  const handlePerRowsChange = (newPerPage, currentPage) => {
    setRowsPerPage(newPerPage)
    setPage(currentPage - 1)
  }

  const onChangeSearch = e => setSearchQuery(e.target.value)
  const { loading, error, data } = useQuery(
    GET_ALL_WITHDRAW_REQUEST,
    {
      variables: {
        page: page,
        rowsPerPage,
        search: searchQuery.length > 2 ? searchQuery : null
      },
      fetchPolicy: 'network-only',
    }
  )

  const [updateStatus] = useMutation(
    gql`
      ${updateWithdrawReqStatus}
    `
  )

  const handleSort = (column, sortDirection) =>
    console.log(column.selector, sortDirection)

  const columns = [
    {
      name: t('RequestID'),
      selector: 'requestId'
    },
    {
      name: t('Rider'),
      sortable: true,
      selector: 'rider',
      cell: row => <>{row.rider ? row.rider.name : null}</>
    },

    {
      name: t('Amount'),
      selector: 'requestAmount'
    },
    {
      name: t('Date'),
      selector: 'requestTime',
      cell: row => <>{new Date(row.requestTime).toDateString()}</>
    },
    {
      name: t('Status'),
      selector: 'status',
      cell: row => (
        <div>
          {row.status}
          <br />
          {updateRequestStatus(row)}
        </div>
      )
    }
  ]

  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null
    const filtered =
    searchQuery.length < 3
      ? data?.withdrawRequests?.requests || []
      : (data?.withdrawRequests?.requests || []).filter((request) => {
          return (
            request.requestId.toLowerCase().search(regex) > -1 ||
            request.rider.name.toLowerCase().search(regex) > -1
          );
        });

    const totalCount = data?.withdrawRequests?.totalCount;
    console.log("🚀 ~ WithdrawRequest ~ totalCount:", totalCount)


  const updateRequestStatus = row => {
    return (
      <>
        <Select
          id="input-status"
          name="input-status"
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          defaultValue={row.status}
          value={row.status}
          className={globalClasses.selectInput}>
          <MenuItem style={{ color: 'black' }} value={''}>
            {t('Status')}
          </MenuItem>
          <MenuItem
            style={{ color: 'black' }}
            value={''}
            onClick={() => {
              if (row.status !== 'REQUESTED') {
                updateStatus({
                  variables: {
                    id: row._id,
                    status: 'REQUESTED'
                  }
                })
              }
            }}>
            {t('REQUESTED')}
          </MenuItem>
          <MenuItem
            style={{ color: 'black' }}
            value={''}
            onClick={() => {
              if (row.status !== 'TRANSFERRED') {
                updateStatus({
                  variables: {
                    id: row._id,
                    status: 'TRANSFERRED'
                  }
                })
              }
            }}>
            {t('TRANSFERRED')}
          </MenuItem>
          <MenuItem
            style={{ color: 'black' }}
            value={''}
            onClick={() => {
              if (row.status !== 'CANCELLED') {
                updateStatus({
                  variables: {
                    id: row._id,
                    status: 'CANCELLED'
                  }
                })
              }
            }}>
            {t('CANCELLEDStatus')}
          </MenuItem>
        </Select>
      </>
    )
  }
  const globalClasses = useGlobalStyles()

  return (
    <>
      <Header />
      <Box className={globalClasses.flexRow} mb={3}>
        <WithdrawIcon />
      </Box>
      <Container className={globalClasses.flex} fluid>
        {error ? <span> `Error! ${error.message}`</span> : null}
        {loading ? (
          <CustomLoader />
        ) : (
          <DataTable
            subHeader={true}
            subHeaderComponent={
              <SearchBar
                value={searchQuery}
                onChange={onChangeSearch}
                placeh
                // onClick={() => refetch()}
              />
            }
            title={<TableHeader title={t('WithdrawRequests')} />}
            columns={columns}
            data={filtered}
            pagination
            paginationServer
            paginationPerPage={rowsPerPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            pointerOnHover
            paginationTotalRows={totalCount}
            progressPending={loading}
            progressComponent={<CustomLoader />}
            onSort={handleSort}
            selectableRows
            paginationDefaultPage={page + 1}
            customStyles={customStyles}
          />
        )}
      </Container>
    </>
  )
}
export default withTranslation()(WithdrawRequest)
