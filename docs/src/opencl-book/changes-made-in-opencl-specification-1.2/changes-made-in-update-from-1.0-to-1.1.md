# Changes made in update from 1.0 to 1.1

As of this writing (2012/1/17), the latest available OpenCL Specification is 1.2, revision 15. This chapter will walk through the changes made in the specification from 1.0 to 1.2.

This section will highlight the changes made between the 1.0 and 1.1 specifications. In particular, changes in the platform layer/runtime, OpenCL C, deprecated functions, as well as the extensions will be discussed.

## _Changes in the OpenCL Platform Layer and the Runtime_

**clGetDeviceInfo()**

This API is used to obtain information about the OpenCL device installed in the system.

> Cl\_int clGetDeviceInfo(cl\_device\_id device, // device returned by clGetDeviceIDs
>
> cl\_device\_info param\_name, // enum of the parameter to obtain
>
> size\_t param\_value\_size, // size of buffer allocated for param\_value
>
> void \*param\_value, // returned param value
>
> size\_t \*param\_value\_size\_ret) // actual size of param\_value returned

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

| cl\_device\_info                                                                               | Return Type  | Description                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL\_DEVICE\_NATIVE\_VECTOR\_WIDTH\_ {CHAR \| SHORT \| INT \| LONG \| FLOAT \| DOUBLE \| HALF}  | cl\_int      | Returns the native ISA vector width                                                                                                                                                         |
| CL\_DEVICE\_HOST\_UNIFIED\_MEMORY                                                              | bool         | Returns CL\_TRUE if the device and the host have a                                                                                                                                          |
|                                                                                                |              | unified memory subsystem, and CL\_FALSE otherwise.                                                                                                                                          |
| CL\_DEVICE\_OPENCL\_C\_VERSION                                                                 | char\[]      | Returns the highest OpenCL C version supported by the compiler for this device. Note that the device itself may support a higher version, which can be obtained using CL\_DEVICE\_VERSION.  |

The return types are changed for the following APIs.

| cl\_device\_info                  | Return Type  | Description                                                                                                                         |
| --------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| CL\_DEVICE\_MAX\_PARAMETER\_SIZE  | size\_t      | Max size in bytes of the arguments that can be passed to a kernel. The minimum value has increased from 256 to 1024 in OpenCL 1.1.  |
| CL\_DEVICE\_LOCAL\_MEM\_SIZE      | cl\_ulong    | Size of local memory area in bytes. The minimum value is 32 KB.                                                                     |

**clGetContextInfo()**

This API is used to obtain information about an OpenCL context.

> Cl\_int clGetContextInfo( cl\_context context, // Context object
>
> Cl\_context\_info param\_name, //enum of the parameter to obtain
>
> Size\_t param\_value\_size, // size of buffer allocated for param\_value
>
> Void \*param\_value, // returned param value
>
> Size\_t \*param\_value\_size\_ret) // actual size of param\_value returned

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

| cl\_context\_info          | Return Type  | Description                                             |
| -------------------------- | ------------ | ------------------------------------------------------- |
| CL\_CONTEXT\_NUM\_DEVICES  | cl\_uint     | Returns the number of devices associated with context.  |

**Image format**

When creating an image object using clCreateImage2D(), clCreateImage3D(), etc, a pointer to the struct cl\_image\_format is passed in, which specifies the properties of the image to be transferred to the object.

> typedef struct \_cl\_image\_format {
>
> cl\_channel\_order image\_channel\_order; // Order of channels
>
> cl\_channel\_type image\_channel\_data\_type; // Channel component information
>
> } cl\_image\_format;

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

\* CL\_Rx

\* CL\_RGx

\* CL\_RGBx

These channel layouts are the same as CL\_R, CL\_RG, CL\_RGB supported in OpenCL 1.0, except for the fact that the value of alpha is set to 0.0f at the edges. (See Figure 5.6, 5.9 from Chapter 5)

**clCreateSubBuffer()**

This function allows a buffer object to be created within an existing buffer object.

> cl\_mem clCreateSubBuffer( cl\_mem buffer, // Buffer object
>
> cl\_mem\_flags flags, // Memory flags
>
> cl\_buffer\_create\_type buffer\_create\_type, // Buffer type
>
> const void \*buffer\_create\_info, // Buffer info
>
> cl\_int \*errcode\_ret) // Error code

The only type that can be passed in as cl\_buffer\_create\_type is the following.

| cl\_buffer\_create\_type          | Description                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| CL\_BUFFER\_CREATE\_TYPE\_REGION  | Create a buffer object that represents a specific region in buffer.  |

The buffer region is specified in buffer\_create\_info, which is a struct as described below:

> typedef struct \_cl\_buffer\_region {
>
> size\_t origin; // Offset into the buffer (in Bytes)
>
> size\_t size; // Size of the buffer (in Bytes)
>
> } cl\_buffer\_region;

If the origin and size is set such that the SubBuffer object region reaches beyond the boundary of the original buffer, CL\_INVALID\_VALUE will be returned.

A SubBuffer object is used to identify a region of the main Buffer, which simplifies the process when working only that region. Note, however, that the SubBuffer cannot be specified in the first parameter to this function, to create a sub-SubBuffer.

**New ways to access Buffer objects**

To access a rectangular region from a buffer objects, the following methods were added: clEnqueueReadBufferRect(), clEnqueueWriteBufferRect(), clEnqueueCopyBufferRect().

**clSetMObjectDestructorCallback()**

This function can be called to register a callback to be called when the destructor for the memory object is called.

> cl\_int clSetMemObjectDestructorCallback(cl\_mem memobj, // Memory object
>
> void (CL\_CALLBACK \*pfn\_notify) (cl\_mem memobj, void \*user\_data), // Callback
>
> void \*user\_data) // Argument passed into to the callback

This function registers a user callback function on a callback stack associated with the memory object.

Since it is a stack, the registered callback functions are called in the reverse order in which they were registered, before the object itself is deleted. _user\_data_ is passed in as an argument for when _pfn\_notify_ is called. This value can be set to NULL if no argument is required. The callback function may be called asynchronously by the OpenCL implementation. The application must make sure the callback function is thread-safe.

**clBuildProgram()**

The OpenCL C version can now be specified when building a program object.

> \-cl-std=

The OpenCL C version can be set, for example, by passing in "-cl=CL1.1" in the build option. If this is not set, the kernel will be built with using the value of CL\_DEVICE\_OPENCL\_C\_VERSION. If the specified OpenCL C exceeds that of CL\_DEVICE\_OPENCL\_C\_VERSION, which is the latest version specified, the build will fail with the appropriate code.

**clGetKernelWorkGroupInfo()**

This function retrieves information about the kernel object that may be specific to a device.

> cl\_int clGetKernelWorkGroupInfo(cl\_kernel kernel, // kernel object
>
> cl\_device\_id device, // device
>
> cl\_kernel\_work\_group\_info param\_name, // the parameter to obtain
>
> size\_t param\_value\_size, // size of buffer allocated for param\_value
>
> void \*param\_value, // returned param value
>
> size\_t \*param\_value\_size\_ret) // actual size of param value returned

The OpenCL 1.1 specification allows the following additional parameters to be obtained.

| cl\_kernel\_work\_group\_info                        | Return Type  | Description                                                    |
| ---------------------------------------------------- | ------------ | -------------------------------------------------------------- |
| CL\_KERNEL\_PREFERRED\_WORK\_GROUP\_ SIZE\_MULTIPLE  | size\_t      | Returns the preferred multiple of work-group size for launch.  |

Calling this function provides a performance hint for when determining the workgroup size to use.

> cl\_event clCreateUserEvent(cl\_context context, // associated context
>
> cl\_int \*errcode\_ret) // Error code

Once created, the status of the event object is set to CL\_SUBMITTED. This status can be changed by calling the following.

> cl\_int clSetUserEventStatus(cl\_event event, // event for which to set status
>
> cl\_int execution\_status) // status to set to

The values that can be set for _execution\_status_ is CL\_COMPLETE for successful operation, or a negative number representing an error. The function may only be called once to change the status of the event.

The introduction of user event allows for a command to be executed on the device only after the user event has finished.

| Column - More about Event Objects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p>User Event is a type of an Event Object, which holds one of the following states when placed in a command queue using an OpenCL runtime: </p><p>* CL_QUEUE: This indicates that the command has been enqueued in the command queue. This is the initial status for all events except user events. </p><p>* CL_SUBMITTED: This is the initial state for all user events. For all other events, this indicates that the command has been submitted by the host to the device. </p><p>* CL_RUNNING: The device is currently executing the command. </p><p>* CL_COMPLETE: The command has executed successfully. </p><p>* Error Code: The command has returned with an error. </p> |

**clSetEventCallback()**

This function sets a callback to be called based on the event status.

> cl\_int clSetEventCallback(cl\_event event, // associated event
>
> cl\_int command\_exec\_callback\_type, // status for which the callback is registered
>
> void (CL\_CALLBACK \*pfn\_event\_notify) (cl\_event event,
>
> // event object that calls the callback
>
> cl\_int event\_command\_exec\_status, //status of command for which this callback function is invoked
>
> void \*user\_data), // user-supplied data
>
> void \*user\_data) // user-supplied data

The callback function (pfn\_event\_notify) is triggered when the associated event enters the status specified in the 2nd argument (command\_exec\_callback\_type).

The only value that can be passed in the 2nd argument is CL\_COMPLETE. (OpenCL 1.2 allows CL\_SUBMITTED and CL\_RUNNING). The callback function may be called asynchronously by the OpenCL implementation. The application must make sure the callback function is thread-safe.

**clEnqueueNDRangeKernel()**

This function is used to execute a kernel on the device. In the OpenCL 1.0 specification, the only argument that can be set as the 4th parameter (global\_work\_offset) was NULL. In OpenCL 1.1, an offset value may be entered, which is used to compute the global ID of the work-item. When NULL is set, the offset is set to 0 for each dimension.

**Thread-Safety**

All function call is now thread-safe, with the exception of clSetKernelArg().

## _Changes in OpenCL C_

**3-element vectors**

OpenCL C supports the following data types: char, uchar, short, ushort, int, uint, float, long, and ulong. Vector data type can be defined by concatenating a data type with an integer value representing the number of elements in the vector. For example, a vector data type consisting of 4 float values is defined as float4.

OpenCL 1.0 supported 2, 4, 8, and 16 as the number of elements. OpenCL 1.1 now allows a vector with 3-elements to be created.

**New built-in functions**

The following built-in functions are now available:

* size\_t get\_global\_offset(uint dimindx)



Retrieves the offset value which is set as the 4th argument to clEnqueueNDRangeKernel(). dimindx is the dimension from which to retrieve the offset from.

* gentype maxmag(gentype x, gentype y)



Returns gentype with a higher magnitude. Returns x if |x| > |y|, y if |y| > |x|, otherwise fmax(x,y). The gentype that is referred to correspond to one of: float, float2, float3, float4, float8, and float16. In OpenCL 1.2, double, double2, double3, double4, double8, and double16 are supported.

* getntype minmag(gentype x, gentype y)



Returns gentype with a lower magnitude. Returns x if |x| C |y|, y if |y| < |x|, otherwise fmin(x,y). The gentype corresponds to one of: float, float2, float3, float4, float8, and float16. In OpenCL 1.2, double, double2, double3, double4, double8, and double16 are supported.

* gentype clamp(gentype x, gentype minval, genotype maxval)

* genotype clamp(gentype x, sgentype minval, sgentype maxval)



Clamps the value of _x_ to minval and maxval. The gentype corresponds to one of: char, char|2|3|4|8|16|, uchar, uchar|2|3|4|8|16|, short, short|2|3|4|8|16|, ushort, ushort|2|3|4|8|16|, int, int|2|3|4|8|16|, uint, uint|2|3|4|8|16|, long, long|2|3|4|8|16|, ulong, ulong|2|3|4|8|16|. sgentype refers to the scalar version of gentype, which is one of: char, uchar, short, ushort, int, uint, long, ulong. The behavior is undefined if _minval_ > _maxval_.

**Extension now a core feature**

The following features that were available as extensions in OpenCL 1.0 are now supported as core features:

* cl\_khr\_byte\_addressable\_store

In OpenCL 1.0, writing to memory using data types with size less than 32-bits to access the address, which includes char, uchar, uchar2, short, ushort, and half, were offered as extensions. OpenCL 1.1 now supports these by default.

* cl\_khr\_global\_int32\_base\_atomics

* cl\_khr\_global\_int32\_extended\_atomics

* cl\_khr\_local\_int32\_base\_atomics

* cl\_khr\_local\_int32\_extended\_atomics



In OpenCL 1.0, atomic operations of int, uint, and float data in \_\_global or \_\_local memory were offered as extensions. OpenCL 1.1 now supports these by default. Note, however, that the name of the function has been changed from atom\_xxx to atomic\_xxx.

**MACROS**

The following macros are defined, which can be used to switch kernel code depending on the OpenCL version.

* CL\_VERSION\_1\_0: substitutes the integer 100 reflecting the OpenCL 1.0 version

* CL\_VERSION\_1\_1: substitutes the integer 110 reflecting the OpenCL 1.1 version.



In OpenCL 1.2 the following will be defined:

* CL\_VERSION\_1\_2: substitutes the integer 120 reflecting the OpenCL 1.2 version.



The above value can be compared with \_\_OPENCL\_VERSION\_\_ to switch between OpenCL versions.

## _Deprecated Functions_

The following features were deprecated in OpenCL 1.1:

* clSetCommandQueueProperty()

* \_\_ROUNDING\_MODE\_\_ macro

* "-cl-strict-aliasing" as an option to clBuildProgram()

**Changes in Extensions**

The following extensions became available in OpenCL 1.1:

* cl\_khr\_gl\_event



While there are other extensions that allows memory objects to be shared between OpenGL and OpenCL, this extension allows creating OpenCL event objects linked to OpenGL fence sync objects, potentially improving efficiency of sharing images and buffers between the two APIs.

* cl\_khr\_d3d10\_sharing \


This extension provides interoperability between OpenCL and Direct3D 10. This is designed to function analogously to the OpenGL interoperability, providing functions for sharing memory objects, as well as other utility functions.

**Changes in OpenCL Embedded Profile**

Support for 64bit integer is now an option.
