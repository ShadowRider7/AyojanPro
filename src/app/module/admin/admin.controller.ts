import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const listUsers = catchAsync(async (req, res) => {
	const users = await adminService.listUsers({
		role: req.query.role as never,
		status: req.query.status as string | undefined,
		search: req.query.search as string | undefined,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users retrieved successfully",
		data: users,
	});
});

const listEvents = catchAsync(async (req, res) => {
	const events = await adminService.listEvents({
		status: req.query.status as string | undefined,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Events retrieved successfully",
		data: events,
	});
});

const listContracts = catchAsync(async (req, res) => {
	const contracts = await adminService.listContracts({
		status: req.query.status as string | undefined,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Contracts retrieved successfully",
		data: contracts,
	});
});

const listPayments = catchAsync(async (req, res) => {
	const payments = await adminService.listPayments({
		status: req.query.status as string | undefined,
		stage: req.query.stage as string | undefined,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payments retrieved successfully",
		data: payments,
	});
});

const updateUserStatus = catchAsync(async (req, res) => {
	const user = await adminService.updateUserStatus(
		req.params.id as string,
		req.body,
		req.user!,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User status updated successfully",
		data: user,
	});
});

export const adminController = {
	listUsers,
	listEvents,
	listContracts,
	listPayments,
	updateUserStatus,
};
