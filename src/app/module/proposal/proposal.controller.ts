import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { proposalService } from "./proposal.service";

const createProposal = catchAsync(async (req, res) => {
	const proposal = await proposalService.createProposal(
		req.params.eventId as string,
		req.body,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Proposal submitted successfully",
		data: proposal,
	});
});

const getProposals = catchAsync(async (req, res) => {
	const proposals = await proposalService.getProposals(
		req.params.requirementId as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Proposals retrieved successfully",
		data: proposals,
	});
});

const getProposalDetails = catchAsync(async (req, res) => {
	const proposal = await proposalService.getProposalDetails(
		req.params.id as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Proposal retrieved successfully",
		data: proposal,
	});
});

// NOTE: `:id` here refers to a ProposalItem id — acceptance/rejection/
// withdrawal happens per line item, not per whole Proposal, since one
// Proposal can span multiple service requirements.
const acceptProposal = catchAsync(async (req, res) => {
	const contract = await proposalService.acceptProposalItem(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Proposal accepted, contract created",
		data: contract,
	});
});

const rejectProposal = catchAsync(async (req, res) => {
	const item = await proposalService.rejectProposalItem(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Proposal rejected",
		data: item,
	});
});

const withdrawProposal = catchAsync(async (req, res) => {
	const item = await proposalService.withdrawProposalItem(
		req.params.id as string,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Proposal withdrawn",
		data: item,
	});
});

export const proposalController = {
	createProposal,
	getProposals,
	getProposalDetails,
	acceptProposal,
	rejectProposal,
	withdrawProposal,
};
