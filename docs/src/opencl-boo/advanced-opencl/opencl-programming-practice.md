---
description: >-
  This section will go over some parallel processing methods that can be used in
  OpenCL.
---

# OpenCL Programming Practice

We will use a sample application that analyzes stock price data to walk through porting of standard C code to OpenCL C in order to utilize a device. The analysis done in this application is to compute the moving average of the stock price for different stocks.&#x20;

We will start from a normal C code, and gradually convert sections of the code to be processed in parallel. This should aid you in gaining intuition on how to parallelize your code.&#x20;

A moving average filter is used commonly in image processing and signal processing as a low-pass filter.&#x20;

Note that the sample code shown in this section is meant to be pedagogical in order to show how OpenCL is used. You may not experience any speed-up depending on the type of hardware you have.&#x20;

### _Standard Single-Thread Programming_&#x20;

We will first walk through a standard C code of the moving average function. The function has the following properties.&#x20;

• Stock price data in passed in as an int-array named "value". The result of the moving average is returned as an array of floats with the name "average".&#x20;

• The array length is passed in as "length" of type int&#x20;

• The width of the data to compute the average for is passed in as "width" of type int&#x20;

To make the code more intuitive, the code on List 5.21 gets rid of all error checks that would normally be performed. This function is what we want to process on the device, so this is the code will eventually be ported into kernel code.&#x20;

**List 5.21: Moving average of integers implemented in standard C**&#x20;

```
void moving_average(int *values,
                    float *average,
                    int length,
                    int width)
{
    int i;
    int add_value;

    /* Compute sum for the first "width" elements */
    add_value = 0;
    for (i = 0; i < width; i++)
    {
        add_value += values[i];
    }
    average[width - 1] = (float)add_value;

    /* Compute sum for the (width)th ～ (length-1)th elements */
    for (i = width; i < length; i++)
    {
        add_value = add_value - values[i - width] + values[i];
        average[i] = (float)(add_value);
    }

    /* Insert zeros to 0th ～ (width-2)th element */
    for (i = 0; i < width - 1; i++)
    {
        average[i] = 0.0f;
    }

    /* Compute average from the sum */
    for (i = width - 1; i < length; i++)
    {
        average[i] /= (float)width;
    }
}
```

In this example, each indices of the average array contain the average of the previous width-1 values and the value of that index. Zeros are placed for average\[0] \~ average\[width-2] in lines 22\~25, since this computation will require values not contained in the input array. In other words, if the width is 3, average\[3] contain the average of value\[1], value\[2] and value\[3]. The value of average\[0] \~ average\[width-2] = average\[1] are zeros, since it would require value\[-2] and value\[-1].&#x20;

The average itself is computed by first summing up the "width" number of values and storing it into the average array (lines 9-20). Lines 9-14 computes the sum of the first "width" elements, and stores it in average\[width-1]. Lines 16-20 computes the sum for the remaining indices. This is done by starting from the previously computed sum, subtracting the oldest value and adding the newest value, which is more efficient than computing the sum of "width" elements each time. This works since the input data is an integer type, but if the input is of type float, this method may result in rounding errors, which can become significant over time. In this case, a method shown in **List 5.22** should be used.&#x20;

**List 5.22: Moving average of floats implemented in standard C**&#x20;

```
void moving_average_float(float *values,
                          float *average,
                          int length,
                          int width)
{
    int i, j;
    float add_value;

    /* Insert zeros to 0th ~ (width-2)th elements */
    for (i = 0; i < width - 1; i++)
    {
        average[i] = 0.0f;
    }

    /* Compute average of (width-1) ~ (length-1) elements */
    for (i = width - 1; i < length; i++)
    {
        add_value = 0.0f;
        for (j = 0; j < width; j++)
        {
            add_value += values[i - j];
        }
        average[i] = add_value / (float)width;
    }
}
```

We will now show a main() function that will call the function in **List 5.21** to perform the computation (**List 5.24**). The input data is placed in a file called "stock\_array1.txt", whose content is shown in **List 5.23**.&#x20;

**List 5.23: Input data (stock\_array1.txt)**&#x20;

> 100,&#x20;
>
> 109,&#x20;
>
> 98,&#x20;
>
> 104,&#x20;
>
> 107,&#x20;
>
> ...&#x20;
>
> 50&#x20;

**List 5.24: Standard C main() function to all the moving average function**&#x20;

```
#include <stdio.h>
#include <stdlib.h>

/* Read Stock data */
int stock_array1[] = {
#include "stock_array1.txt"
};

/* Define width for the moving average */
#define WINDOW_SIZE (13)

int main(int argc, char *argv[])
{

    float *result;

    int data_num = sizeof(stock_array1) / sizeof(stock_array1[0]);
    int window_num = (int)WINDOW_SIZE;

    int i;

    /* Allocate space for the result */
    result = (float *)malloc(data_num * sizeof(float));

    /* Call the moving average function */
    moving_average(stock_array1,
                   result,
                   data_num,
                   window_num);

    /* Print result */
    for (i = 0; i < data_num; i++)
    {
        printf("result[%d] = %f¥n", i, result[i]);
    }

    /* Deallocate memory */
    free(result);
}
```

The above code will be eventually transformed into a host code that will call the moving average kernel.

We have now finished writing a single threaded program to compute the moving average. This will now be converted to OpenCL code to use the device. Our journey has just begun.&#x20;

### _Porting to OpenCL_&#x20;

The first step is to convert the moving\_average() function to kernel code, or OpenCL C. This code will be executed on the device. The code in **List 5.21** becomes as shown in **List 5.25** after porting.&#x20;

**List 5.25: Moving average kernel (moving\_average.cl)**&#x20;

```
__kernel void moving_average(__global int *values,
                             __global float *average,
                             int length,
                             int width)
{
    int i;
    int add_value;

    /* Compute sum for the first "width" elements */
    add_value = 0;
    for (i = 0; i < width; i++)
    {
        add_value += values[i];
    }
    average[width - 1] = (float)add_value;

    /* Compute sum for the (width)th ～ (length-1)th elements */
    for (i = width; i < length; i++)
    {
        add_value = add_value - values[i - width] + values[i];
        average[i] = (float)(add_value);
    }

    /* Insert zeros to 0th ~ (width-2)th elements */
    for (i = 0; i < width - 1; i++)
    {
        average[i] = 0.0f;
    }

    /* Compute average of (width-1) ~ (length-1) elements */
    for (i = width - 1; i < length; i++)
    {
        average[i] /= (float)width;
    }
}
```

Note that we have only changed lines 1 and 2, which adds the \_\_kernel qualifier to the function, and the address qualifier \_\_global specifying the location of the input data and where the result will be placed.&#x20;

The host code is shown in **List 5.26**.&#x20;

**List 5.26: Host code to execute the moving\_average() kernel**&#x20;

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

/* Read Stock data */
int stock_array1[] = {
#include "stock_array1.txt"
};

/* Define width for the moving average */
#define WINDOW_SIZE (13)

#define MAX_SOURCE_SIZE (0x100000)

int main(void)
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_in = NULL;
    cl_mem memobj_out = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    float *result;
    cl_int ret;
    FILE *fp;

    int data_num = sizeof(stock_array1) / sizeof(stock_array1[0]);
    int window_num = (int)WINDOW_SIZE;
    int i;

    /* Allocate space to read in kernel code */
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);

    /* Allocate space for the result on the host side */
    result = (float *)malloc(data_num * sizeof(float));

    /* Get Platform */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);

    /* Get Device */
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                         &ret_num_devices);

    /* Create Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create Command Queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Read Kernel Code */
    fp = fopen("moving_average.cl", "r");
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create Program Object */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);
    /* Compile kernel */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create Kernel */
    kernel = clCreateKernel(program, "moving_average", &ret);

    /* Create buffer for the input data on the device */
    memobj_in = clCreateBuffer(context, CL_MEM_READ_WRITE,
                               data_num * sizeof(int), NULL, &ret);

    /* Create buffer for the result on the device */
    memobj_out = clCreateBuffer(context, CL_MEM_READ_WRITE,
                                data_num * sizeof(float), NULL, &ret);

    /* Copy input data to the global memory on the device*/
    ret = clEnqueueWriteBuffer(command_queue, memobj_in, CL_TRUE, 0,
                               data_num * sizeof(int),
                               stock_array1, 0, NULL, NULL);

    /* Set kernel arguments */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj_in);
    ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&memobj_out);
    ret = clSetKernelArg(kernel, 2, sizeof(int), (void *)&data_num);
    ret = clSetKernelArg(kernel, 3, sizeof(int), (void *)&window_num);

    /* Execute the kernel */
    ret = clEnqueueTask(command_queue, kernel, 0, NULL, NULL);

    /* Copy result from device to host */
    ret = clEnqueueReadBuffer(command_queue, memobj_out, CL_TRUE, 0,
                              data_num * sizeof(float),
                              result, 0, NULL, NULL);

    /* OpenCL Object Finalization */
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj_in);
    ret = clReleaseMemObject(memobj_out);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    /* Display Results */
    for (i = 0; i < data_num; i++)
    {
        printf("result[%d] = %f¥n", i, result[i]);
    }

    /* Deallocate memory on the host */
    free(result);
    free(kernel_src_str);

    return 0;
}
```

This host is based on the code in **List 5.24**, adding the OpenCL runtime API commands required for the kernel execution. Note the code utilizes the online compile method, as the kernel source code is read in (Lines 60-69).&#x20;

However, although the code is executable, it is not written to run anything in parallel. The next section will show how this can be done.&#x20;

### _Vector Operations_&#x20;

First step to see whether vector-types can be used for the processing. For vector types, we can expect the OpenCL implementation to perform operations using the SIMD units on the processor to speed up the computation. We will start looking at multiple stocks from this section, as this is more practical. The processing will be vector-ized such that the moving average computation for each stock will be executed in parallel. We will assume that the processor will have a 128-bit SIMD unit, to operate on four 32-bit data in parallel. In OpenCL, types such as int4 and float4 can be used.&#x20;

**List 5.27** shows the price data for multiple stocks, where each row contains the price of multiple stocks at one instance in time. For simplicity's sake, we will process the data for 4 stocks in this section (**List 5.28**).&#x20;

**List 5.27: Price data for multiple stocks (stock\_array\_many.txt)**&#x20;

> 100, 212, 315, 1098, 763, 995, ..., 12&#x20;
>
> 109, 210, 313, 1100, 783, 983, ..., 15&#x20;
>
> 98, 209, 310, 1089, 790, 990, ..., 18&#x20;
>
> 104, 200, 319, 1098, 792, 985, ..., 21&#x20;
>
> 107, 100, 321, 1105, 788, 971, ..., 18&#x20;
>
> …&#x20;
>
> 50, 33, 259, 980, 687, 950, ..., 9&#x20;

**List 5.28: Price data for 4 stocks (stock\_array\_4.txt)**&#x20;

> 100, 212, 315, 1098,&#x20;
>
> 109, 210, 313, 1100,&#x20;
>
> 98, 209, 310, 1089,&#x20;
>
> 104, 200, 319, 1098,&#x20;
>
> 107, 100, 321, 1105,&#x20;
>
> …&#x20;
>
> 50, 33, 259, 980&#x20;

For processing 4 values at a time, we can just replace int and float with int4 and float4, respectively. The new kernel code will look like **List 5.29**.&#x20;

**List 5.29: Vector-ized moving average kernel (moving\_average\_vec4.cl)**&#x20;

```
__kernel void moving_average_vec4(__global int4 *values,
                                  __global float4 *average,
                                  int length,
                                  int width)
{
    int i;
    int4 add_value; /* A vector to hold 4 components */

    /* Compute sum for the first "width" elements for 4 stocks */
    add_value = (int4)0;
    for (i = 0; i < width; i++)
    {
        add_value += values[i];
    }
    average[width - 1] = convert_float4(add_value);

    /* Compute sum for the (width)th ～ (length-1)th elements for 4 stocks */
    for (i = width; i < length; i++)
    {
        add_value = add_value - values[i - width] + values[i];
        average[i] = convert_float4(add_value);
    }

    /* Insert zeros to 0th ～ (width-2)th element for 4 stocks*/
    for (i = 0; i < width - 1; i++)
    {
        average[i] = (float4)(0.0f);
    }

    /* Compute average of (width-1) ~ (length-1) elements for 4 stocks */
    for (i = width - 1; i < length; i++)
    {
        average[i] /= (float4)width;
    }
}
```

The only differences from **List 5.25** is the conversion of scalar to vector type (Lines 1,7,10 for int and Lines 2,24,29 for float), and the use of convert\_float4() function. Note that the operators (+, -, \*, /) are overloaded to be used on vector-types, so these do not need to be changed (Lines 12, 18, 29).&#x20;

The host code for executing the kernel is shown in **List 5.30**.&#x20;

**List 5.30: Host code to run the vector-ized moving average kernel**&#x20;

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

#define NAME_NUM (4)  /* Number of Stocks */
#define DATA_NUM (21) /* Number of data to process for each stock*/

/* Read Stock data */
int stock_array_4[NAME_NUM * DATA_NUM] = {
#include "stock_array_4.txt"
};

/* Moving average width */
#define WINDOW_SIZE (13)

#define MAX_SOURCE_SIZE (0x100000)

int main(void)
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_in = NULL;
    cl_mem memobj_out = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    float *result;
    cl_int ret;
    FILE *fp;

    int window_num = (int)WINDOW_SIZE;
    int point_num = NAME_NUM * DATA_NUM;
    int data_num = (int)DATA_NUM;
    int name_num = (int)NAME_NUM;
    int i, j;

    /* Allocate space to read in kernel code */
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);

    /* Allocate space for the result on the host side */
    result = (float *)malloc(point_num * sizeof(float));

    /* Get Platform */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);

    /* Get Device */
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                         &ret_num_devices);

    /* Create Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create command queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Read kernel source code */
    fp = fopen("moving_average_vec4.cl", "r");
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create Program Object */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);

    /* Compile kernel */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create kernel */
    kernel = clCreateKernel(program, "moving_average_vec4", &ret);

    /* Create buffer for the input data on the device */
    memobj_in = clCreateBuffer(context, CL_MEM_READ_WRITE,
                               point_num * sizeof(int), NULL, &ret);

    /* Create buffer for the result on the device */
    memobj_out = clCreateBuffer(context, CL_MEM_READ_WRITE,
                                point_num * sizeof(float), NULL, &ret);

    /* Copy input data to the global memory on the device*/
    ret = clEnqueueWriteBuffer(command_queue, memobj_in, CL_TRUE, 0,
                               point_num * sizeof(int),
                               stock_array_4, 0, NULL, NULL);

    /* Set Kernel Arguments */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj_in);
    ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&memobj_out);
    ret = clSetKernelArg(kernel, 2, sizeof(int), (void *)&data_num);
    ret = clSetKernelArg(kernel, 3, sizeof(int), (void *)&window_num);

    /* Execute kernel */
    ret = clEnqueueTask(command_queue, kernel, 0, NULL, NULL);

    /* Copy result from device to host */
    ret = clEnqueueReadBuffer(command_queue, memobj_out, CL_TRUE, 0,
                              point_num * sizeof(float),
                              result, 0, NULL, NULL);

    /* OpenCL Object Finalization */
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj_in);
    ret = clReleaseMemObject(memobj_out);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    /* Print results */
    for (i = 0; i < data_num; i++)
    {
        printf("result[%d]:", i);
        for (j = 0; j < name_num; j++)
        {
            printf("%f, ", result[i * NAME_NUM + j]);
        }
        printf("¥n");
    }

    /* Deallocate memory on the host */
    free(result);
    free(kernel_src_str);

    return 0;
}
```

The only difference from **List 5.26** is that the data to process is increased by a factor of 4, and that the data length parameter is hard coded. In addition, the kernel code that gets read is changed to moving\_average\_vec4.cl (line 66), and the kernel name is changed to moving\_average\_vec4 (line 78).&#x20;

We will now change the program to allow processing of more than 4 stocks, as in the data in **List 5.27**. For simplicity, we will assume the number of stocks to process is a multiple of 4. We could just call the kernel on **List 5.29** and vector-ize the input data on the host side, but we will instead allow the kernel to take care of this.&#x20;

Since we will be processing 4 stocks at a time, the kernel code will just have to loop the computation so that more than 4 stocks can be computed within the kernel. The kernel will take in a parameter "name\_num", which is the number of stocks to process. This will be used to calculate the number of loops required to process all stocks.&#x20;

The new kernel code is shown in **List 5.31** below.&#x20;

**List 5.31: Moving average kernel of (multiple of 4) stocks (moving\_average\_many.cl)**&#x20;

```
__kernel void moving_average_many(__global int4 *values,
                                  __global float4 *average,
                                  int length,
                                  int name_num,
                                  int width)
{
    int i, j;
    int loop_num = name_num / 4; /* compute the number of times to loop */
    int4 add_value;

    for (j = 0; j < loop_num; j++)
    {
        /* Compute sum for the first "width" elements for 4 stocks */
        add_value = (int4)0;
        for (i = 0; i < width; i++)
        {
            add_value += values[i * loop_num + j];
        }
        average[(width - 1) * loop_num + j] = convert_float4(add_value);

        /* Compute sum for the (width)th ~ (length-1)th elements for 4 stocks */
        for (i = width; i < length; i++)
        {
            add_value = add_value - values[(i - width) * loop_num + j] + values[i * loop_num + j];
            average[i * loop_num + j] = convert_float4(add_value);
        }

        /* Insert zeros to 0th ～ (width-2)th element for 4 stocks*/
        for (i = 0; i < width - 1; i++)
        {
            average[i * loop_num + j] = (float4)(0.0f);
        }

        /* Compute average of (width-1) ~ (length-1) elements for 4 stocks */
        for (i = width - 1; i < length; i++)
        {
            average[i * loop_num + j] /= (float4)width;
        }
    }
}
```

The host code is shown in **List 5.32**.&#x20;

**List 5.32: Host code for calling the kernel in List 5.31**&#x20;

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

#define NAME_NUM (8)  /* Number of stocks */
#define DATA_NUM (21) /* Number of data to process for each stock */

/* Read Stock data */
int stock_array_many[NAME_NUM * DATA_NUM] = {
#include "stock_array_many.txt"
};

/* Moving average width */
#define WINDOW_SIZE (13)

#define MAX_SOURCE_SIZE (0x100000)

int main(void)
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_in = NULL;
    cl_mem memobj_out = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    float *result;
    cl_int ret;
    FILE *fp;

    int window_num = (int)WINDOW_SIZE;
    int point_num = NAME_NUM * DATA_NUM;
    int data_num = (int)DATA_NUM;
    int name_num = (int)NAME_NUM;

    int i, j;

    /* Allocate space to read in kernel code */
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);

    /* Allocate space for the result on the host side */
    result = (float *)malloc(point_num * sizeof(float));

    /* Get Platform*/
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);

    /* Get Device */
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                         &ret_num_devices);

    /* Create Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create Command Queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Read kernel source code */
    fp = fopen("moving_average_many.cl", "r");
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create Program Object */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);

    /* Compile kernel */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create kernel */
    kernel = clCreateKernel(program, "moving_average_many", &ret);

    /* Create buffer for the input data on the device */
    memobj_in = clCreateBuffer(context, CL_MEM_READ_WRITE,
                               point_num * sizeof(int), NULL, &ret);

    /* Create buffer for the result on the device */
    memobj_out = clCreateBuffer(context, CL_MEM_READ_WRITE,
                                point_num * sizeof(float), NULL, &ret);

    /* Copy input data to the global memory on the device*/
    ret = clEnqueueWriteBuffer(command_queue, memobj_in, CL_TRUE, 0,
                               point_num * sizeof(int),
                               stock_array_many, 0, NULL, NULL);

    /* Set Kernel Arguments */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj_in);
    ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&memobj_out);
    ret = clSetKernelArg(kernel, 2, sizeof(int), (void *)&data_num);
    ret = clSetKernelArg(kernel, 3, sizeof(int), (void *)&name_num);
    ret = clSetKernelArg(kernel, 4, sizeof(int), (void *)&window_num);

    /* Execute kernel */
    ret = clEnqueueTask(command_queue, kernel, 0, NULL, NULL);

    /* Copy result from device to host */
    ret = clEnqueueReadBuffer(command_queue, memobj_out, CL_TRUE, 0,
                              point_num * sizeof(float),
                              result, 0, NULL, NULL);

    /* OpenCL Object Finalization */
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj_in);
    ret = clReleaseMemObject(memobj_out);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    /* Print results */
    for (i = 0; i < data_num; i++)
    {
        printf("result[%d]:", i);
        for (j = 0; j < name_num; j++)
        {
            printf("%f, ", result[i * NAME_NUM + j]);
        }
        printf("¥n");
    }

    /* Deallocate memory on the host */
    free(result);
    free(kernel_src_str);

    return 0;
}
```

The only difference from List 5.30 is that the number of stocks to process has been increased to 8, which get passed in as an argument to the kernel (line 98). In addition, the kernel code that gets read is changed to moving\_average\_many.cl (line 67), and the kernel name is changed to moving\_average\_many (line 79).&#x20;

This section concentrated on using SIMD units to perform the same process on multiple data sets in parallel. This is the most basic method of parallelization, which is done simply by replacing scalar-types with vector-types. The next step is expanding this to use multiple compute units capable of performing SIMD operations.&#x20;

### _Data Parallel Processing_&#x20;

This section will focus on using multiple compute units to perform moving average for multiple stocks. Up until this point, only one instance of the kernel was executed, which processed all the data. To use multiple compute units simultaneously, multiple kernel instances must be executed in parallel. They can either be the same kernel running in parallel (data parallel), or different kernels in parallel (task parallel). We will use the data parallel model, as this method is more suited for this process.&#x20;

We will use the kernel in **List 5.31** as the basis to perform the averaging on 8 stocks. Since this code operates on 4 data sets at once, we can use 2 compute units to perform operations on 8 data sets at once. This is achieved by setting the work group size to 2 when submitting the task.&#x20;

In order to use the data parallel mode, each instance of the kernel must know where it is being executed within the index space. If this is not done, the same kernel will run on the same data sets. The get\_global\_id() function can be used to get the kernel instance's global ID, which happens to be the same value as the value of the iterator "j". Therefore, the code in **List 5.31** can be rewritten to the following code in **List 5.33**.&#x20;

**List 5.33: Moving average kernel for 4 stocks (moving\_average\_vec4\_para.cl)**&#x20;

```
__kernel void moving_average_vec4_para(__global int4 *values,
                                       __global float4 *average,
                                       int length,
                                       int name_num,
                                       int width)
{
    int i, j;
    int loop_num = name_num / 4;
    int4 add_value;

    j = get_global_id(0); /* Used to select different data set for each instance */

    /* Compute sum for the first "width" elements for 4 stocks */
    add_value = (int4)0;
    for (i = 0; i < width; i++)
    {
        add_value += values[i * loop_num + j]; /* "j" decides on the data subset to process for the kernel instance*/
    }
    average[(width - 1) * loop_num + j] = convert_float4(add_value);

    /* Compute sum for the (width)th ~ (length-1)th elements for 4 stocks */
    for (i = width; i < length; i++)
    {
        add_value = add_value - values[(i - width) * loop_num + j] + values[i * loop_num + j];
        average[i * loop_num + j] = convert_float4(add_value);
    }

    /* Insert zeros to 0th ～ (width-2)th element for 4 stocks*/
    for (i = 0; i < width - 1; i++)
    {
        average[i * loop_num + j] = (float4)(0.0f);
    }

    /* Compute average of (width-1) ~ (length-1) elements for 4 stocks */
    for (i = width - 1; i < length; i++)
    {
        average[i * loop_num + j] /= (float4)width;
    }
}
```

Since each compute unit is executing an instance of the kernel, which performs operations on 4 data sets, 8 data sets are processed over 2 compute units. In line 11, the value of "j" is either 0 or 1, which specifies the instance of the kernel as well as the data set to process. To take the change in the kernel into account, the host code must be changed as shown below in **List 5.34**.&#x20;

**List 5.34: Host code for calling the kernel in List 5.33**&#x20;

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

#define NAME_NUM (8)  /* Number of stocks */
#define DATA_NUM (21) /* Number of data to process for each stock */

/* Read Stock data */
int stock_array_many[NAME_NUM * DATA_NUM] = {
#include "stock_array_many.txt"
};

/* Moving average width */
#define WINDOW_SIZE (13)

#define MAX_SOURCE_SIZE (0x100000)

int main(void)
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_in = NULL;
    cl_mem memobj_out = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    float *result;
    cl_int ret;
    FILE *fp;

    int window_num = (int)WINDOW_SIZE;
    int point_num = NAME_NUM * DATA_NUM;
    int data_num = (int)DATA_NUM;
    int name_num = (int)NAME_NUM;

    int i, j;

    /* Allocate space to read in kernel code */
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);

    /* Allocate space for the result on the host side */
    result = (float *)malloc(point_num * sizeof(float));

    /* Get Platform*/
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);

    /* Get Device */
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                         &ret_num_devices);

    /* Create Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create Command Queue */
    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);

    /* Read kernel source code */
    fp = fopen("moving_average_vec4_para.cl", "r");
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create Program Object */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);

    /* Compile kernel */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create kernel */
    kernel = clCreateKernel(program, "moving_average_vec4_para", &ret);

    /* Create buffer for the input data on the device */
    memobj_in = clCreateBuffer(context, CL_MEM_READ_WRITE,
                               point_num * sizeof(int), NULL, &ret);

    /* Create buffer for the result on the device */
    memobj_out = clCreateBuffer(context, CL_MEM_READ_WRITE,
                                point_num * sizeof(float), NULL, &ret);

    /* Copy input data to the global memory on the device*/
    ret = clEnqueueWriteBuffer(command_queue, memobj_in, CL_TRUE, 0,
                               point_num * sizeof(int),
                               stock_array_many, 0, NULL, NULL);

    /* Set Kernel Arguments */
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&memobj_in);
    ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&memobj_out);
    ret = clSetKernelArg(kernel, 2, sizeof(int), (void *)&data_num);
    ret = clSetKernelArg(kernel, 3, sizeof(int), (void *)&name_num);
    ret = clSetKernelArg(kernel, 4, sizeof(int), (void *)&window_num);

    /* Set parameters for data parallel processing (work item) */
    cl_uint work_dim = 1;
    size_t global_item_size[3];
    size_t local_item_size[3];

    global_item_size[0] = 2; /* Global number of work items */
    local_item_size[0] = 1;  /* Number of work items per work group */
    /* --> global_item_size[0] / local_item_size[0] becomes 2, which indirectly sets the number of workgroups to 2*/

    /* Execute Data Parallel Kernel */
    ret = clEnqueueNDRangeKernel(command_queue, kernel, work_dim, NULL,
                                 global_item_size, local_item_size,
                                 0, NULL, NULL);

    /* Copy result from device to host */
    ret = clEnqueueReadBuffer(command_queue, memobj_out, CL_TRUE, 0,
                              point_num * sizeof(float),
                              result, 0, NULL, NULL);

    /* OpenCL Object Finalization */
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj_in);
    ret = clReleaseMemObject(memobj_out);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    /* Deallocate memory on the host */
    for (i = 0; i < data_num; i++)
    {
        printf("result[%d]: ", i);
        for (j = 0; j < name_num; j++)
        {
            printf("%f, ", result[i * NAME_NUM + j]);
        }
        printf("¥n");
    }

    /* Deallocate memory on the host */
    free(result);
    free(kernel_src_str);

    return 0;
}
```

The data parallel processing is performed in lines 112 - 114, but notice the number of work groups are not explicitly specified. This is implied from the number of global work items (line 107) and the number of work items to process using one compute unite (line 108). It is also possible to execute multiple work items on 1 compute unit. This number should be equal to the number of processing elements within the compute unit for efficient data parallel execution.

### _Task Parallel Processing_&#x20;

We will now look at a different processing commonly performed in stock price analysis, known as the Golden Cross. The Golden Cross is a threshold point between a short-term moving average and a long-term moving average over time, which indicates a bull market on the horizon. This will be implemented in a task parallel manner.&#x20;

Unlike data parallel programming, OpenCL does not have an API to explicitly specify the index space for batch processing. Each process need to be queued explicitly using the API function clEnqueueTask().&#x20;

As mentioned in Chapter 4, the command queue only allows one task to be executed at a time unless explicitly specified to do otherwise. The host side must do one of the following:&#x20;

• Allow out-of-order execution of the queued commands&#x20;

• Create multiple command queues&#x20;

Creating multiple command queues will allow for explicit scheduling of the tasks by the programmer. In this section, we will use the out-of-order method and allow the API to take care of the scheduling.&#x20;

Allowing out-of-order execution in the command queue sends the next element in queue to an available compute unit. The out-of-order mode can be set as follows.&#x20;

> Command\_queue = clCreateCommandQueue(context, device\_id,&#x20;
>
> CL\_QUEUE\_OUT\_OF\_ORDER\_EXEC\_MODE\_ENABLE, \&ret);&#x20;

The 3rd argument CL\_QUEUE\_OUT\_OF\_ORDER\_EXEC\_MODE\_ENABLE allows the command queue to send the next queued task to an available compute unit. This ends up in a scheduling of task parallel processing.&#x20;

We will now perform task parallel processing to find the Golden Cross between a moving average over 13 weeks, and a moving average over 26 weeks. The two moving averages will be performed in a task parallel manner. We will use the code in **List 5.29** (moving\_average\_vec4.cl), varying the 4th argument to 13 and 26 for each of the moving average to be performed. The host code becomes as shown in **List 5.35**.&#x20;

**List 5.35: Host code for task parallel processing of 2 moving averages**&#x20;

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

#define NAME_NUM (4)   /* Number of stocks */
#define DATA_NUM (100) /* Number of data to process for each stock */

/* Read Stock data */
int stock_array_4[NAME_NUM * DATA_NUM] = {
#include "stock_array_4.txt"
};

/* Moving average width */
#define WINDOW_SIZE_13 (13)
#define WINDOW_SIZE_26 (26)

#define MAX_SOURCE_SIZE (0x100000)

int main(void)
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem memobj_in = NULL;
    cl_mem memobj_out13 = NULL;
    cl_mem memobj_out26 = NULL;
    cl_program program = NULL;
    cl_kernel kernel13 = NULL;
    cl_kernel kernel26 = NULL;
    cl_event event13, event26;
    size_t kernel_code_size;
    char *kernel_src_str;
    float *result13;
    float *result26;
    cl_int ret;
    FILE *fp;

    int window_num_13 = (int)WINDOW_SIZE_13;
    int window_num_26 = (int)WINDOW_SIZE_26;
    int point_num = NAME_NUM * DATA_NUM;
    int data_num = (int)DATA_NUM;
    int name_num = (int)NAME_NUM;

    int i, j;

    /* Allocate space to read in kernel code */
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);

    /* Allocate space for the result on the host side */
    result13 = (float *)malloc(point_num * sizeof(float)); /* average over 13 weeks */
    result26 = (float *)malloc(point_num * sizeof(float)); /* average over 26 weeks */

    /* Get Platform */
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);

    /* Get Device */
    ret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                         &ret_num_devices);

    /* Create Context */
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    /* Create Command Queue */
    command_queue = clCreateCommandQueue(context, device_id,
                                         CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE, &ret);

    /* Read kernel source code */
    fp = fopen("moving_average_vec4.cl", "r");
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create Program Object */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);

    /* Compile kernel */
    ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);

    /* Create kernel */
    kernel13 = clCreateKernel(program, "moving_average_vec4", &ret); /* 13 weeks */
    kernel26 = clCreateKernel(program, "moving_average_vec4", &ret); /* 26 weeks */

    /* Create buffer for the input data on the device */
    memobj_in = clCreateBuffer(context, CL_MEM_READ_WRITE,
                               point_num * sizeof(int), NULL, &ret);

    /* Create buffer for the result on the device */
    memobj_out13 = clCreateBuffer(context, CL_MEM_READ_WRITE,
                                  point_num * sizeof(float), NULL, &ret); /* 13 weeks */
    memobj_out26 = clCreateBuffer(context, CL_MEM_READ_WRITE,
                                  point_num * sizeof(float), NULL, &ret); /* 26 weeks */

    /* Copy input data to the global memory on the device*/
    ret = clEnqueueWriteBuffer(command_queue, memobj_in, CL_TRUE, 0,
                               point_num * sizeof(int),
                               stock_array_4, 0, NULL, NULL);

    /* Set Kernel Arguments (13 weeks) */
    ret = clSetKernelArg(kernel13, 0, sizeof(cl_mem), (void *)&memobj_in);
    ret = clSetKernelArg(kernel13, 1, sizeof(cl_mem), (void *)&memobj_out13);
    ret = clSetKernelArg(kernel13, 2, sizeof(int), (void *)&data_num);
    ret = clSetKernelArg(kernel13, 3, sizeof(int), (void *)&window_num_13);

    /* Submit task to compute the moving average over 13 weeks */
    ret = clEnqueueTask(command_queue, kernel13, 0, NULL, &event13);

    /* Set Kernel Arguments (26 weeks) */
    ret = clSetKernelArg(kernel26, 0, sizeof(cl_mem), (void *)&memobj_in);
    ret = clSetKernelArg(kernel26, 1, sizeof(cl_mem), (void *)&memobj_out26);
    ret = clSetKernelArg(kernel26, 2, sizeof(int), (void *)&data_num);
    ret = clSetKernelArg(kernel26, 3, sizeof(int), (void *)&window_num_26);

    /* Submit task to compute the moving average over 26 weeks */
    ret = clEnqueueTask(command_queue, kernel26, 0, NULL, &event26);

    /* Copy result for the 13 weeks moving average from device to host */
    ret = clEnqueueReadBuffer(command_queue, memobj_out13, CL_TRUE, 0,
                              point_num * sizeof(float),
                              result13, 1, &event13, NULL);

    /* Copy result for the 26 weeks moving average from device to host */
    ret = clEnqueueReadBuffer(command_queue, memobj_out26, CL_TRUE, 0,
                              point_num * sizeof(float),
                              result26, 1, &event26, NULL);

    /* OpenCL Object Finalization */
    ret = clReleaseKernel(kernel13);
    ret = clReleaseKernel(kernel26);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(memobj_in);
    ret = clReleaseMemObject(memobj_out13);
    ret = clReleaseMemObject(memobj_out26);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);

    /* Display results */
    for (i = window_num_26 - 1; i < data_num; i++)
    {
        printf("result[%d]:", i);
        for (j = 0; j < name_num; j++)
        {
            /* Display whether the 13 week average is greater */
            printf("[%d] ", (result13[i * NAME_NUM + j] > result26[i * NAME_NUM + j]));
        }
        printf("¥n");
    }

    /* Deallocate memory on the host */
    free(result13);
    free(result26);
    free(kernel_src_str);

    return 0;
}
```

The Golden Cross Point can be determined by seeing where the displayed result changes from 0 to 1.&#x20;

One thing to note in this example code is that the copying of the result from device to host should not occur until the processing is finished. Otherwise, the memory copy (clEnqueueReadBuffer) can occur during the processing, which would contain garbage.&#x20;

Note in line 114 that "\&event13" is passed back from the clEnqueueTask() command. This is known as an event object, which specifies whether this task has finished or not. This event object is seen again in line 128 to the clEnqueueReadBuffer() command, which specifies that the read command does not start execution until the computation of the moving average over 13 weeks is finished. This is done similarly for the moving average over 26 weeks, which is submitted in line 123 and written back in line 131.&#x20;

In summary, the Enqueue API functions in general:&#x20;

• Inputs event object(s) that specify what it must wait for until it can be executed&#x20;

• Ouputs an event object that can be used to tell another task in queue to wait&#x20;

The above two should be used to schedule the tasks in an efficient manner.&#x20;
