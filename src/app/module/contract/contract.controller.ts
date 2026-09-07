import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { contractService } from "./contract.service";

const listContracts = catchAsync(async (req, res) => {
	const contracts = await contractService.listContracts(req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contracts retrieved successfully",
		data: contracts,
	});
});

const getContractDetails = catchAsync(async (req, res) => {
	const contract = await contractService.getContractDetails(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contract retrieved successfully",
		data: contract,
	});
});

const cancelContract = catchAsync(async (req, res) => {
	const contract = await contractService.cancelContract(
		req.params.id as string,
		req.body?.reason,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contract cancelled successfully",
		data: contract,
	});
});

const attachDeliverable = catchAsync(async (req, res) => {
	const result = await contractService.attachDeliverable(
		req.params.id as string,
		req.body,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Deliverable submitted, contract marked as delivered",
		data: result,
	});
});

const getDeliverable = catchAsync(async (req, res) => {
	const deliverable = await contractService.getDeliverable(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Deliverable retrieved successfully",
		data: deliverable,
	});
});

const completeContract = catchAsync(async (req, res) => {
	const contract = await contractService.completeContract(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contract marked as completed",
		data: contract,
	});
});

export const contractController = {
	listContracts,
	getContractDetails,
	cancelContract,
	attachDeliverable,
	getDeliverable,
	completeContract,
};
