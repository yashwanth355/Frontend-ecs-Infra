import instance from "./config/axios"
import routes from "./constants/routes"
import url from "./constants/url"

export const login = (data) => {
    return instance.post(`${url.apiUrl}${routes.login}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err.message, err.code))
}

export const forgetPassword = (data) => {
    return instance.post(`${url.apiUrl}${routes.forget}`, data)
        .then(res => {
            return res;
        })
        .catch(err => console.log("Error from forget password api", err.message, err.code))
}

export const confirmForgotPassword = (data) => {
    return instance.post(`${url.apiUrl}${routes.confirmForgotPassword}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from forget password api", err.message, err.code))
}

export const registerUser = (data) => {
    return instance.post(`${url.apiUrl}${routes.registerUser}`, data)
        .then(res => {
            if (res) {
                instance.post(`${url.apiUrl}${routes.insertUser}`, data)
                    .then(res => {
                        return res;
                    })
            }
            return res;
        })

    // instance.post(`${url.apiUrl}${routes.registerUser}`, data)
    // .then(res => {
    //     return res;
    // })
    // return instance.post(`${url.apiUrl}${routes.insertUser}`, data)
    // .then(res => {
    //     return res;
    // })
}

export const updateUser = (data) => {
    return instance.post(`${url.apiUrl}${routes.insertUser}`, data)
        .then(res => {
            return res;
        })
}
// export const CreatedUser = (data) => {
//     instance.post(`${url.apiUrl}${routes.CreatedUser}`, data)
//     .then(res => {
//         return res;
//     })
//     return instance.post(`${url.apiUrl}${routes.insertUser}`, data)
//     .then(res => {
//         return res;
//     })
// }

export const getUserPool = () => {
    return instance.get(`${url.apiUrl}${routes.listPoolUsers}`)
        .then(res => {
            return res;
        })
        .catch(err => console.log("Error from get users list api", err.message, err.code))
}

export const getUserDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.userDetail}`, data)
        .then(res => {
            return res;
        })
        .catch(err => console.log("Error from get users list api", err.message, err.code))
}

export const changeUserStatus = (data) => {
    return instance.post(`${url.apiUrl}${routes.userStatus}`, data)
        .then(res => {
            return res;
        })
}

export const changeUserStatusDisable = (data) => {
    return instance.post(`${url.apiUrl}${routes.userStatusDisable}`, data)
        .then(res => {
            return res;
        })
}

export const changePassword = (data) => {
    return instance.post(`${url.apiUrl}${routes.changePassword}`, data)
        .then(res => {
            return res;
        })
}

export const getLeads = (data) => {
    return instance.post(`${url.apiUrl}${routes.leads}`, data)
        .then(res => {
            return res;
        })
}

export const getAccounts = (data) => {
    return instance.post(`${url.apiUrl}${routes.accounts}`, data)
        .then(res => {
            return res;
        })
}
export const getContacts = (data) => {
    return instance.post(`${url.apiUrl}${routes.contacts}`, data)
        .then(res => {
            return res;
        })
}
export const getQuotes = (data) => {
    return instance.post(`${url.apiUrl}${routes.quotes}`, data)
        .then(res => {
            return res;
        })
}



export const getRoles = () => {
    return instance.get(`${url.apiUrl}${routes.userRole}`)
        .then(res => {
            return res;
        })
}

export const getCompanyNames = () => {
    return instance.get(`${url.apiUrl}${routes.companyName}`)
        .then(res => {
            return res;
        })
}

export const getDesignation = () => {
    return instance.get(`${url.apiUrl}${routes.designation}`)
        .then(res => {
            return res;
        })
}


export const getDepartmentNames = () => {
    return instance.get(`${url.apiUrl}${routes.departmentName}`)
        .then(res => {
            return res;
        })
}

export const getDivisionNames = (data) => {
    return instance.post(`${url.apiUrl}${routes.division}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err.message, err.code))
}

export const getDelegatedApprover = () => {
    return instance.get(`${url.apiUrl}${routes.delegatedApprover}`)
        .then(res => {
            return res;
        })
}

export const getCountryNames = () => {
    return instance.get(`${url.apiUrl}${routes.country}`)
        .then(res => {
            return res;
        })
}

export const getStateNames = (data) => {
    return instance.post(`${url.apiUrl}${routes.state}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err.message, err.code))
}

export const getCityNames = (data) => {
    return instance.post(`${url.apiUrl}${routes.city}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err.message, err.code))
}

export const getProfileName = () => {
    return instance.get(`${url.apiUrl}${routes.profile}`)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err.message, err.code))
}

export const createLead = (data) => {
    return instance.post(`${url.apiUrl}${routes.insertLead}`, data)
        .then(res => {
            return res;
        })
}

export const getLeadsInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.leadsInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getContactsInLeadtoAcc = (data) => {
    return instance.post(`${url.apiUrl}${routes.contactsInleadToAccount}`, data)
        .then(res => {
            return res;
        })
}

export const getLeadsDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.leadsDetail}`, data)
        .then(res => {
            return res;
        })
}

export const convertLeadToAccount = (data) => {
    return instance.post(`${url.apiUrl}${routes.convertLeadToAccount}`, data)
        .then(res => {
            return res;
        })
}

export const getUsers = (data) => {
    return instance.post(`${url.apiUrl}${routes.getUsers}`, data)
        .then(res => {
            return res;
        })
}

export const getProductAndCategory = (data) => {
    return instance.post(`${url.apiUrl}${routes.getProductAndCategory}`, data)
        .then(res => {
            return res;
        })
}

export const getQuotesInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.quotesInfo}`, data)
        .then(res => {
            return res;
        })
}

export const createQuote = (data) => {
    return instance.post(`${url.apiUrl}${routes.insertQuote}`, data)
        .then(res => {
            return res;
        })
}

export const getSampleRequests = (params) => {
    return instance.post(`${url.apiUrl}${routes.sampleRequests}`, params)
        .then(res => {
            return res;
        })
}

export const getAccountDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.accountsDetail}`, data)
        .then(res => {
            return res;
        })
}

export const createAccountContact = (data) => {
    return instance.post(`${url.apiUrl}${routes.accountContact}`, data)
        .then(res => {
            return res;
        })
}

export const createAccountSample = (data) => {
    return instance.post(`${url.apiUrl}${routes.accountSample}`, data)
        .then(res => {
            return res;
        })
}

export const viewSampleRequest = (data) => {
    return instance.post(`${url.apiUrl}${routes.viewSample}`, data)
        .then(res => {
            return res;
        })
}

export const createSample = (data) => {
    return instance.post(`${url.apiUrl}${routes.insertSample}`, data)
        .then(res => {
            return res;
        })
}

export const getQuoteItems = (data) => {
    return instance.post(`${url.apiUrl}${routes.getQuoteItems}`, data)
        .then(res => {
            return res;
        })
}

export const createQuoteItem = (data) => {
    return instance.post(`${url.apiUrl}${routes.insertQuoteItem}`, data)
        .then(res => {
            return res;
        })
}
export const updateQuoteItem = (data) => {
    return instance.post(`${url.apiUrl}${routes.updateQuoteItem}`, data)
        .then(res => {
            return res;
        })
}
export const updateQuoteStatus = (data) => {
    return instance.post(`${url.apiUrl}${routes.updateQuoteStatus}`, data)
        .then(res => {
            return res;
        })
}
export const getQuoteItemsInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteItemsInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getAccountContacts = (data) => {
    return instance.post(`${url.apiUrl}${routes.getAccountContacts}`, data)
        .then(res => {
            return res;
        })
}

export const getAccountSamples = (data) => {
    return instance.post(`${url.apiUrl}${routes.getAccountSamples}`, data)
        .then(res => {
            return res;
        })
}

export const getAccountQuotes = (data) => {
    return instance.post(`${url.apiUrl}${routes.getAccountQuotes}`, data)
        .then(res => {
            return res;
        })
}

export const reAssignLead = (data) => {
    return instance.post(`${url.apiUrl}${routes.reassignLead}`, data)
        .then(res => {
            return res;
        })
}
export const reassignAccount = (data) => {
    return instance.post(`${url.apiUrl}${routes.reassignAccount}`, data)
        .then(res => {
            return res;
        })
}
export const getQuotationInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.quotesInfoErp}`, data)
        .then(res => {
            return res;
        })
}

export const getQuoteItemSystemInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteItemSystemInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getQuoteItemSystemPackInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteItemSystemPackInfo}`, data)
        .then(res => {
            return res;
        })
}

export const requestQuotePriceInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteRequestPrice}`, data)
        .then(res => {
            return res;
        })
}

export const quoteSamples = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteSamples}`, data)
        .then(res => {
            return res;
        })
}

export const quoteSamplePricing = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteSamplePricing}`, data)
        .then(res => {
            return res;
        })
}

export const quoteRequestGCRates = (data) => {
    return instance.post(`${url.apiUrl}${routes.quoteRequestGCRates}`, data)
        .then(res => {
            return res;
        })
}

export const currencyConversion = (data) => {
    return instance.post(`${url.apiUrl}${routes.currencyConversion}`, data)
        .then(res => {
            return res;
        })
}

export const getPOCreationInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.poCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getPoCreationInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.PoCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getAllPurchaseOrders = (data) => {
    return instance.post(`${url.apiUrl}${routes.getAllPurchaseOrders}`, data)
        .then(res => {
            return res;
        })
}

export const createGCPurchaseOrders = (data) => {
    return instance.post(`${url.apiUrl}${routes.createGCPo}`, data)
        .then(res => {
            return res;
        })
}

export const updateGCPurchaseOrders = (data) => {
    return instance.post(`${url.apiUrl}${routes.updateGCPo}`, data)
        .then(res => {
            return res;
        })
}

export const updateGCPoStatus = (data) => {
    return instance.post(`${url.apiUrl}${routes.gCPoStatus}`, data)
        .then(res => {
            return res;
        })
}

export const getGCApprovedQuotes = (data) => {
    return instance.post(`${url.apiUrl}${routes.approvedQuotesOnGC}`, data)
        .then(res => {
            return res;
        })
}

export const getTopApprovedPOs = (data) => {
    return instance.post(`${url.apiUrl}${routes.topApprovedPos}`, data)
        .then(res => {
            return res;
        })
}

export const getTopMrinDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.topMrin}`, data)
        .then(res => {
            return res;
        })
}

export const getPODetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.poDetails}`, data)
        .then(res => {
            return res;
        })
}

// MRIN
export const getMRINs = (data) => {
    return instance.post(`${url.apiUrl}${routes.getAllmrins}`, data)
        .then(res => {
            return res;
        })
}
export const getMRINDetail = (data) => {
    return instance.post(`${url.apiUrl}${routes.mrinDetails}`, data)
        .then(res => {
            return res;
        })
}
export const createOrUpdateMRINDetail = (data) => {
    return instance.post(`${url.apiUrl}${routes.createOrUpdateMrin}`, data)
        .then(res => {
            return res;
        })
}

// get entity and po details
export const getMrinCreationDetail = (data) => {
    return instance.post(`${url.apiUrl}${routes.getMrinCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

// get mring based on po no
export const getMrinListForPoDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.getMrinListForPoView}`, data)
        .then(res => {
            return res;
        })
}

export const createVendorDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.createVendor}`, data)
        .then(res => {
            return res;
        })
}

export const getPortAndOriginForPo = (data) => {
    return instance.post(`${url.apiUrl}${routes.portAndOriginForPo}`, data)
        .then(res => {
            return res;
        })
}

export const getBalQuoteQtyForPoOrder = (data) => {
    return instance.post(`${url.apiUrl}${routes.balQuoteQtyForPoOrder}`, data)
        .then(res => {
            return res;
        })
}

export const poDocumentsUpload = (data) => {
    return instance.post(`${url.apiUrl}${routes.poDocuments}`, data)
        .then(res => {
            return res;
        })
}

// GC
export const getGCs = (data) => {
    return instance.post(`${url.apiUrl}${routes.getGCs}`, data)
        .then(res => {
            return res;
        })
}

export const getgcDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.getGCDetail}`, data)
        .then(res => {
            return res;
        })
}

// supplier
export const getSuppliers = (data) => {
    return instance.post(`${url.apiUrl}${routes.getSuppliers}`, data)
        .then(res => {
            return res;
        })
}

export const getSuppliersList = (data) => {
    return instance.post(`${url.apiUrl}${routes.getSupplierList}`, data)
        .then(res => {
            return res;
        })
}

export const editSupplier = (data) => {
    return instance.post(`${url.apiUrl}${routes.editSupplier}`, data)
        .then(res => {
            return res;
        })
}

export const CreateOrEditSupplier = (data) => {
    return instance.post(`${url.apiUrl}${routes.curdSupplier}`, data)
        .then(res => {
            return res;
        })
}

export const getGcCreationInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.getGcCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const createOrUpdateGcDetail = (data) => {
    return instance.post(`${url.apiUrl}${routes.createOrUpdateGcDetail}`, data)
        .then(res => {
            return res;
        })
}

export const vendorLogin = (data) => {
    return instance.post(`${url.apiUrl}${routes.vendorLogin}`, data)
        .then(res => {
            return res;
        })
}

export const getDispatchDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.getDispatchDetails}`, data)
        .then(res => {
            return res;
        })
}

export const getGCDebitNoteCreationInfo = (data) => {
    return instance.post(`${url.apiUrl}${routes.getGCDebitNoteCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getlistGCDebitNoteDetails = (data) => {
    return instance.post(`${url.apiUrl}${routes.listGCDebitNoteDetails}`, data)
        .then(res => {
            return res;
        })
}

export const getinsertOrEditGCDebitNoteDetail = (data) => {
    return instance.post(`${url.apiUrl}${routes.insertOrEditGCDebitNoteDetail}`, data)
        .then(res => {
            return res;
        })
}

export const getviewGCDebitNoteDetail = (data) => {
    return instance.post(`${url.apiUrl}${routes.viewGCDebitNoteDetail}`, data)
        .then(res => {
            return res;
        })
}

export const getupdateGcDebitNoteStatus = (data) => {
    return instance.post(`${url.apiUrl}${routes.updateGcDebitNoteStatus}`, data)
        .then(res => {
            return res;
        })
}

export const createorupdateSampleLineItem = (data) => {
    return instance.post(`${url.apiUrl}${routes.createorupdateSampleLineItem}`, data)
        .then(res => {
            return res;
        })
}

export const viewAndDeleteSampleLineItem = (data) => {
    return instance.post(`${url.apiUrl}${routes.viewAndDeleteSampleLineItem}`, data)
        .then(res => {
            return res;
        })
}

export const getNotifications = (data) => {
    return instance.post(`${url.apiUrl}${routes.getNotifications}`, data)
        .then(res => {
            return res;
        })
}

export const updateMRINGCSpec = (data) => {
    return instance.post(`${url.apiUrl}${routes.updateMRINGCSpec}`, data)
        .then(res => {
            return res;
        })
}
export const sendMail = (url,data) => {
    return instance.post(`${url}${routes.sendEmail}`, data)
        .then(res => {
            return res;
        })
}
export const releaseDebitNoteGC = (data) => {
    return instance.post(`${url.apiUrl}${routes.releaseDebitNote}`, data)
        .then(res => {
            return res;
        })
}

























