export default class ApiResponse<T = any> {
  ok(data: T): { success: true; data: T; statusCode: 200 } {
    return {
      success: true,
      data,
      statusCode: 200,
    };
  }

  created(data: T): { success: true; data: T; statusCode: 201 } {
    return {
      success: true,
      data,
      statusCode: 201,
    };
  }

  noContent(): { success: true; statusCode: 204 } {
    return {
      success: true,
      statusCode: 204,
    };
  }

  error(
    error: Error,
    statusCode: number = 500,
  ): {
    success: false;
    error: { message: string; name: string };
    statusCode: number;
  } {
    return {
      success: false,
      error: {
        message: error.message,
        name: error.name,
      },
      statusCode,
    };
  }
}
