import httpStatus from "http-status";
import type { DisputeStatus } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { disputeService } from "./dispute.service";

const raiseDispute = catchAsync(async (req, res) => {
	const dispute = await disputeService.raiseDispute(
		req.params.id as string,
		req.body,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Dispute raised successfully",
		data: dispute,
	});
});

const listDisputes = catchAsync(async (req, res) => {
	const disputes = await disputeService.listDisputes(req.user!, {
		status: req.query.status as DisputeStatus | undefined,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Disputes retrieved successfully",
		data: disputes,
	});
});

const getDisputeDetails = catchAsync(async (req, res) => {
	const dispute = await disputeService.getDisputeDetails(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dispute retrieved successfully",
		data: dispute,
	});
});

const uploadEvidence = catchAsync(async (req, res) => {
	const evidence = await disputeService.uploadEvidence(
		req.params.id as string,
		req.body,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Evidence uploaded successfully",
		data: evidence,
	});
});

const updateDisputeStatus = catchAsync(async (req, res) => {
	const dispute = await disputeService.updateDisputeStatus(
		req.params.id as string,
		req.body,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dispute status updated successfully",
		data: dispute,
	});
});

const resolveDispute = catchAsync(async (req, res) => {
	const dispute = await disputeService.resolveDispute(
		req.params.id as string,
		req.body.resolution,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dispute resolved successfully",
		data: dispute,
	});
});

export const disputeController = {
	raiseDispute,
	listDisputes,
	getDisputeDetails,
	uploadEvidence,
	updateDisputeStatus,
	resolveDispute,
};
